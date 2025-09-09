const { Order, OrderItem, CartItem, Product, User, sequelize } = require('../models');

// POST /api/orders/checkout - Membuat pesanan dari keranjang
exports.checkout = async (req, res) => {
    const userId = req.userId;
    // Mulai sebuah transaksi database
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
            return res.status(400).send({ message: "Keranjang belanja Anda kosong." });
        }

        // 2. Hitung total harga dan siapkan item pesanan
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cartItems) {
            // Cek ketersediaan stok
            if (item.Product.stock_quantity < item.quantity) {
                await t.rollback();
                return res.status(400).send({ message: `Stok untuk produk '${item.Product.name}' tidak mencukupi.` });
            }
            totalAmount += item.quantity * parseFloat(item.Product.price);
            orderItemsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_per_unit: item.Product.price // Simpan harga saat checkout
            });
        }
        
        // 3. Ambil alamat pengiriman dari profil user
        const user = await User.findByPk(userId, { transaction: t });
        if (!user || !user.address) {
            await t.rollback();
            return res.status(400).send({ message: "Alamat pengiriman tidak ditemukan di profil Anda." });
        }

        // 4. Buat record 'Order' baru
        const order = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            shipping_address: user.address, // Gunakan alamat dari profil user
            status: 'paid' // Asumsi pembayaran langsung berhasil
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

        await OrderTrackingHistory.create({
            order_id: order.id,
            status: 'paid',
            status_description: 'Pembayaran berhasil dikonfirmasi',
            updated_by: userId
        }, { transaction: t });

        // Jika semua langkah berhasil, commit transaksi
        await t.commit();
        res.status(201).send({ message: "Checkout berhasil! Pesanan Anda telah dibuat.", orderId: order.id });


    } catch (error) {
        // Jika ada satu saja error, batalkan semua perubahan
        await t.rollback();
        res.status(500).send({ message: "Gagal melakukan checkout: " + error.message });
    }
};

// GET /api/orders - Mengambil riwayat pesanan pengguna
exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil riwayat pesanan: " + error.message });
    }
};

// GET /api/orders/:id - Mengambil detail satu pesanan
exports.getOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.id;

        const order = await Order.findOne({
            where: { id: orderId, user_id: userId }, // Pastikan pesanan milik user yg login
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) {
            return res.status(404).send({ message: "Pesanan tidak ditemukan." });
        }

        res.status(200).send(order);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil detail pesanan: " + error.message });
    }
};