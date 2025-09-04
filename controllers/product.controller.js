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
            include: [{
                model: Review,
                as: 'Reviews', // Pastikan alias ini cocok dengan di model Product Anda
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