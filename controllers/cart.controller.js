const { CartItem, Product } = require('../models');

// GET /api/cart - Mengambil semua isi keranjang pengguna (DENGAN TOTAL HARGA)
exports.getCart = async (req, res) => {
    try {
        const userId = req.userId; // Didapat dari middleware

        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'image_url']
            }],
            order: [['createdAt', 'DESC']]
        });

        // --- INI BAGIAN BARUNYA ---
        // Hitung total harga
        let totalPrice = 0;
        cartItems.forEach(item => {
            // Pastikan item.Product tidak null
            if (item.Product) {
                totalPrice += item.quantity * parseFloat(item.Product.price);
            }
        });

        // Kirim respons dalam format objek yang rapi
        res.status(200).send({
            cartItems: cartItems,
            totalPrice: totalPrice
        });
        // -------------------------

    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil data keranjang: " + error.message });
    }
};

// POST /api/cart - Menambah produk ke keranjang
exports.addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { product_id, quantity } = req.body;

        let cartItem = await CartItem.findOne({
            where: {
                user_id: userId,
                product_id: product_id
            }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                user_id: userId,
                product_id: product_id,
                quantity: quantity
            });
        }

        res.status(201).send({ message: "Produk berhasil ditambahkan ke keranjang!", data: cartItem });
    } catch (error) {
        res.status(500).send({ message: "Gagal menambahkan ke keranjang: " + error.message });
    }
};

// PUT /api/cart/:productId - Mengupdate kuantitas item di keranjang
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const { quantity } = req.body;

        const cartItem = await CartItem.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });

        if (!cartItem) {
            return res.status(404).send({ message: "Item tidak ditemukan di keranjang." });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).send({ message: "Kuantitas item berhasil diperbarui.", data: cartItem });

    } catch (error) {
        res.status(500).send({ message: "Gagal memperbarui item di keranjang: " + error.message });
    }
};

// DELETE /api/cart/:productId - Menghapus item dari keranjang
exports.deleteCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const cartItem = await CartItem.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });

        if (!cartItem) {
            return res.status(404).send({ message: "Item tidak ditemukan di keranjang." });
        }

        await cartItem.destroy();
        res.status(200).send({ message: "Item berhasil dihapus dari keranjang." });

    } catch (error) {
        res.status(500).send({ message: "Gagal menghapus item dari keranjang: " + error.message });
    }
};