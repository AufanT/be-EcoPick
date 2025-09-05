const { Product, Category, Review, User } = require('../models');
const { Op } = require('sequelize');

// --- API UNTUK ETALASE PRODUK (PUBLIK) ---

// GET /api/products - Mengambil semua produk dengan filter dan paginasi
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;

        // Persiapan filter
        let whereClause = {};
        const { search, categoryId, ecoFriendly } = req.query;

        // Filter berdasarkan pencarian (nama produk)
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }

        // Filter berdasarkan ID kategori
        if (categoryId) {
            whereClause.category_id = categoryId;
        }

        // Filter produk yang eco-friendly
        if (ecoFriendly === 'true') {
            whereClause.is_eco_friendly_admin = true;
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
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

// GET /api/products/:id - Mengambil detail produk beserta ulasannya
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            attributes: { exclude: ['createdAt', 'updatedAt', 'is_eco_friendly_admin'] },
            include: [{
                model: Review,
                as: 'Reviews', 
                attributes: { exclude: ['updatedAt'] },
                include: [{
                    model: User,
                    attributes: ['full_name']
                }]
            }]
        });

        if (!product) {
            return res.status(404).send({ message: "Produk tidak ditemukan." });
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil detail produk: " + error.message });
    }
};

// GET /api/categories - Mengambil semua kategori
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil kategori: " + error.message });
    }
};


// --- API UNTUK ULASAN (MEMERLUKAN LOGIN) ---

// POST /api/products/:id/reviews - Membuat ulasan baru
exports.createReview = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.userId; 
        const { rating, comment } = req.body;

        const review = await Review.create({
            product_id: productId,
            user_id: userId,
            rating: rating,
            comment: comment
        });

        res.status(201).send({ message: "Ulasan berhasil ditambahkan!", data: review });
    } catch (error) {
        res.status(500).send({ message: "Gagal menambahkan ulasan: " + error.message });
    }
};

exports.getSimilarProductsRecommendation = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Cari produk terakhir yang dilihat oleh pengguna
        const lastViewedHistory = await UserProductViewHistory.findOne({
            where: { user_id: userId },
            order: [['updatedAt', 'DESC']], // Diurutkan berdasarkan kapan terakhir dilihat
            include: [Product] // Ambil data produknya juga
        });

        // Jika tidak ada riwayat, jangan tampilkan rekomendasi apa pun
        if (!lastViewedHistory || !lastViewedHistory.Product) {
            return res.status(200).send([]); // Kirim array kosong
        }

        const lastViewedProduct = lastViewedHistory.Product;
        const lastViewedCategoryId = lastViewedProduct.category_id;

        // 2. Cari produk lain dalam kategori yang sama
        const similarProducts = await Product.findAll({
            where: {
                category_id: lastViewedCategoryId,
                // PENTING: Jangan sertakan produk yang sedang dilihat itu sendiri dalam rekomendasi
                id: { [Op.ne]: lastViewedProduct.id } 
            },
            limit: 10 // Batasi jumlah rekomendasi menjadi 5 produk
        });

        res.status(200).send(similarProducts);

    } catch (error) {
        res.status(500).send({ message: "Gagal mengambil rekomendasi produk serupa: " + error.message });
    }
};