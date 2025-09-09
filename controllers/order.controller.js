const { Order, OrderItem, CartItem, Product, User, OrderTrackingHistory, sequelize } = require('../models');

// POST /api/orders/checkout - Membuat pesanan dari keranjang
exports.checkout = async (req, res) => {
    const userId = req.userId;
    const t = await sequelize.transaction();

    try {
        // 1. Ambil semua item dari keranjang pengguna
        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [Product],
            transaction: t
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).send({ 
                success: false,
                message: "Keranjang belanja Anda kosong." 
            });
        }

        // 2. Hitung total harga dan siapkan item pesanan
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cartItems) {
            // Cek ketersediaan stok
            if (item.Product.stock_quantity < item.quantity) {
                await t.rollback();
                return res.status(400).send({ 
                    success: false,
                    message: `Stok untuk produk '${item.Product.name}' tidak mencukupi.` 
                });
            }
            
            // FIX: Use precise decimal calculation for money
            const itemPrice = parseFloat(item.Product.price);
            const itemTotal = Math.round((item.quantity * itemPrice) * 100) / 100; // Round to 2 decimal places
            totalAmount += itemTotal;
            
            orderItemsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_per_unit: itemPrice
            });
        }
        
        // 3. Ambil alamat pengiriman dari profil user
        const user = await User.findByPk(userId, { transaction: t });
        if (!user || !user.address) {
            await t.rollback();
            return res.status(400).send({ 
                success: false,
                message: "Alamat pengiriman tidak ditemukan di profil Anda." 
            });
        }

        // 4. Buat record 'Order' baru
        const order = await Order.create({
            user_id: userId,
            total_amount: Math.round(totalAmount * 100) / 100, // Ensure precision
            shipping_address: user.address,
            status: 'paid'
        }, { transaction: t });

        // 5. Buat record 'OrderItem' untuk setiap produk
        await OrderItem.bulkCreate(
            orderItemsData.map(item => ({ ...item, order_id: order.id })),
            { transaction: t }
        );

        // 6. Kurangi stok produk
        for (const item of cartItems) {
            await Product.update(
                { stock_quantity: item.Product.stock_quantity - item.quantity },
                { where: { id: item.product_id }, transaction: t }
            );
        }

        // 7. Kosongkan keranjang belanja pengguna
        await CartItem.destroy({
            where: { user_id: userId },
            transaction: t
        });

        // 8. FIXED: Create tracking history
        await OrderTrackingHistory.create({
            order_id: order.id,
            status: 'paid',
            status_description: 'Pembayaran berhasil dikonfirmasi',
            updated_by: userId
        }, { transaction: t });

        await t.commit();
        
        // FIXED: Consistent response format
        res.status(201).send({ 
            success: true,
            message: "Checkout berhasil! Pesanan Anda telah dibuat.", 
            data: {
                orderId: order.id,
                totalAmount: order.total_amount,
                status: order.status
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Checkout error:', error); // Log for debugging
        
        // FIXED: Don't expose internal error details
        res.status(500).send({ 
            success: false,
            message: "Terjadi kesalahan dalam proses checkout. Silakan coba lagi." 
        });
    }
};

// GET /api/orders - Mengambil riwayat pesanan pengguna
exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Order.findAndCountAll({
            where: { user_id: userId },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        // FIXED: Consistent response format
        res.status(200).send({
            success: true,
            data: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                orders: rows
            }
        });
    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).send({ 
            success: false,
            message: "Gagal mengambil riwayat pesanan." 
        });
    }
};

// GET /api/orders/:id - Mengambil detail satu pesanan
exports.getOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.id;

        const order = await Order.findOne({
            where: { id: orderId, user_id: userId },
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) {
            return res.status(404).send({ 
                success: false,
                message: "Pesanan tidak ditemukan." 
            });
        }

        res.status(200).send({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).send({ 
            success: false,
            message: "Gagal mengambil detail pesanan." 
        });
    }
};
