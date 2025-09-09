const { Product, Category, Order, OrderItem, User, Role } = require('../models');
const { Op } = require('sequelize');

// --- MANAJEMEN PRODUK ---

// GET /api/admin/products - Mengambil semua produk dengan paginasi
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).send({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products: rows
        });
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil data produk: " + error.message });
    }
};

// POST /api/admin/products - Membuat produk baru
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).send({ message: "Produk berhasil dibuat!", data: product });
    } catch (error) {
        res.status(500).send({ message: "Gagal membuat produk: " + error.message });
    }
};

// GET /api/admin/products/:id - Mengambil produk berdasarkan ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan." });
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil detail produk: " + error.message });
    }
};

// PUT /api/admin/products/:id - Memperbarui produk
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan." });
        }

        await product.update(req.body);
        res.status(200).send({ message: "Produk berhasil diperbarui!", data: product });
    } catch (error) {
        res.status(500).send({ message: "Gagal memperbarui produk: " + error.message });
    }
};

// DELETE /api/admin/products/:id - Menghapus produk
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan." });
        }
        
        // Disarankan soft delete, tapi untuk contoh ini kita hard delete
        await product.destroy();
        res.status(200).send({ message: "Produk berhasil dihapus." });
    } catch (error) {
        res.status(500).send({ message: "Gagal menghapus produk: " + error.message });
    }
};


// --- MANAJEMEN KATEGORI ---

// GET /api/admin/categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil kategori: " + error.message });
    }
};

// POST /api/admin/categories
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).send({ message: "Kategori berhasil dibuat!", data: category });
    } catch (error) {
        res.status(500).send({ message: "Gagal membuat kategori: " + error.message });
    }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).send({ message: "Kategori tidak ditemukan." });
        }
        await category.update(req.body);
        res.status(200).send({ message: "Kategori berhasil diperbarui!", data: category });
    } catch (error) {
        res.status(500).send({ message: "Gagal memperbarui kategori: " + error.message });
    }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).send({ message: "Kategori tidak ditemukan." });
        }
        await category.destroy();
        res.status(200).send({ message: "Kategori berhasil dihapus." });
    } catch (error) {
        res.status(500).send({ message: "Gagal menghapus kategori: " + error.message });
    }
};


// --- MANAJEMEN PESANAN ---

// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        const orders = await Order.findAll({ where: whereClause, include: User });
        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil data pesanan: " + error.message });
    }
};

// GET /api/admin/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['id', 'full_name', 'email'] },
                { model: OrderItem, include: [Product] }
            ]
        });
        if (!order) {
            return res.status(404).send({ message: "Pesanan tidak ditemukan." });
        }
        res.status(200).send(order);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil detail pesanan: " + error.message });
    }
};

// PATCH /api/admin/orders/:id
// exports.updateOrderStatus = async (req, res) => {
//     try {
//         const order = await Order.findByPk(req.params.id);
//         if (!order) {
//             return res.status(404).send({ message: "Pesanan tidak ditemukan." });
//         }
//         await order.update({ status: req.body.status });
//         res.status(200).send({ message: "Status pesanan berhasil diperbarui!", data: order });
//     } catch (error) {
//         res.status(500).send({ message: "Gagal memperbarui status pesanan: " + error.message });
//     }
// };


// --- MANAJEMEN PENGGUNA ---

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            include: { model: Role, as: 'role', attributes: ['name'] }
        });
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil data pengguna: " + error.message });
    }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) {
            return res.status(404).send({ message: "Pengguna tidak ditemukan." });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil detail pengguna: " + error.message });
    }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "Pengguna tidak ditemukan." });
        }
        // Pastikan password tidak terupdate dari sini
        const { password_hash, ...updateData } = req.body;
        await user.update(updateData);
        res.status(200).send({ message: "Pengguna berhasil diperbarui!" });
    } catch (error) {
        res.status(500).send({ message: "Gagal memperbarui pengguna: " + error.message });
    }
};