const { WishlistItem, Product, User } = require('../models');

// GET /api/wishlist - Mengambil semua wishlist user
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.userId;

        const wishlistItems = await WishlistItem.findAll({
            where: { user_id: userId },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price', 'image_url', 'stock_quantity']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({
            message: `Ditemukan ${wishlistItems.length} item di wishlist`,
            wishlistItems: wishlistItems
        });
    } catch (error) {
        res.status(500).send({ 
            message: "Gagal mengambil wishlist: " + error.message 
        });
    }
};

// POST /api/wishlist - Menambah produk ke wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { product_id } = req.body;

        // Cek apakah produk sudah ada di wishlist
        const existingItem = await WishlistItem.findOne({
            where: {
                user_id: userId,
                product_id: product_id
            }
        });

        if (existingItem) {
            return res.status(409).send({ 
                message: "Produk sudah ada di wishlist Anda." 
            });
        }

        // Cek apakah produk benar-benar ada
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).send({ 
                message: "Produk tidak ditemukan." 
            });
        }

        // Tambahkan ke wishlist
        const wishlistItem = await WishlistItem.create({
            user_id: userId,
            product_id: product_id,
            added_at: new Date()
        });

        res.status(201).send({ 
            message: "Produk berhasil ditambahkan ke wishlist!",
            data: wishlistItem 
        });

    } catch (error) {
        res.status(500).send({ 
            message: "Gagal menambahkan ke wishlist: " + error.message 
        });
    }
};

// DELETE /api/wishlist/:productId - Menghapus produk dari wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const wishlistItem = await WishlistItem.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });

        if (!wishlistItem) {
            return res.status(404).send({ 
                message: "Produk tidak ditemukan di wishlist." 
            });
        }

        await wishlistItem.destroy();
        res.status(200).send({ 
            message: "Produk berhasil dihapus dari wishlist." 
        });

    } catch (error) {
        res.status(500).send({ 
            message: "Gagal menghapus dari wishlist: " + error.message 
        });
    }
};

// GET /api/wishlist/check/:productId - Mengecek apakah produk ada di wishlist
exports.checkWishlistStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const wishlistItem = await WishlistItem.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });

        res.status(200).send({
            isInWishlist: !!wishlistItem,
            productId: parseInt(productId)
        });

    } catch (error) {
        res.status(500).send({ 
            message: "Gagal mengecek status wishlist: " + error.message 
        });
    }
};