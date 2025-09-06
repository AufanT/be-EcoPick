const { Product, Category, Review, User, UserProductViewHistory, sequelize } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// --- API UNTUK ETALASE PRODUK (PUBLIK) ---

// GET /api/products - Mengambil semua produk dengan filter, paginasi, DAN rekomendasi
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        
        // Check if this is for homepage recommendation
        const isHomepage = req.query.homepage === 'true';
        
        // Get user ID from middleware (if authenticated)
        const userId = req.userId; // Dari verifyToken middleware
        
        let whereClause = {};
        let orderClause = [['createdAt', 'DESC']]; // Default order
        let isPersonalized = false;

        // HOMEPAGE LOGIC - Rekomendasi
        if (isHomepage && userId) {
            // Cek apakah user punya history
            const userViews = await UserProductViewHistory.findAll({
                where: { user_id: userId },
                include: [{
                    model: Product,
                    attributes: ['category_id'],
                    required: true
                }],
                limit: 10,
                order: [['updatedAt', 'DESC']]
            });

            if (userViews.length > 0) {
                // Get most viewed categories
                const categoryIds = userViews.map(view => view.Product.category_id);
                const categoryCount = {};
                
                categoryIds.forEach(catId => {
                    categoryCount[catId] = (categoryCount[catId] || 0) + 1;
                });
                
                // Sort categories by frequency
                const sortedCategories = Object.entries(categoryCount)
                    .sort(([,a], [,b]) => b - a)
                    .map(([catId]) => parseInt(catId));

                // Prioritize products from user's favorite categories
                if (sortedCategories.length > 0) {
                    whereClause.category_id = { [Op.in]: sortedCategories.slice(0, 3) }; // Top 3 categories
                    orderClause = [
                        // Custom ordering: favorite categories first, then by date
                        [sequelize.literal(`CASE 
                            WHEN category_id = ${sortedCategories[0]} THEN 1
                            ${sortedCategories[1] ? `WHEN category_id = ${sortedCategories[1]} THEN 2` : ''}  
                            ${sortedCategories[2] ? `WHEN category_id = ${sortedCategories[2]} THEN 3` : ''}
                            ELSE 4 END`), 'ASC'],
                        ['createdAt', 'DESC']
                    ];
                    isPersonalized = true;
                }
            }
        }

        // SEARCH/FILTER LOGIC (existing) - Only if NOT homepage
        if (!isHomepage) {
            const { search } = req.query;

            // Filter berdasarkan pencarian (nama produk)
            if (search) {
                whereClause.name = { [Op.like]: `%${search}%` };
            }
        }

        // Execute query
        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            order: orderClause
        });

        // Determine response message and type
        let responseMessage = '';
        let responseType = 'search';
        
        if (isHomepage) {
            if (isPersonalized) {
                responseMessage = 'Rekomendasi Untuk Anda';
                responseType = 'personalized';
            } else {
                responseMessage = 'Produk Terbaru';
                responseType = 'latest';
            }
        } else {
            responseMessage = `Ditemukan ${count} produk`;
            responseType = 'search';
        }

        res.status(200).send({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products: rows,
            isPersonalized: isPersonalized,
            message: responseMessage,
            type: responseType
        });

    } catch (error) {
        res.status(500).send({ 
            message: "Gagal mengambil data produk: " + error.message 
        });
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
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            
            // Menggunakan Promise agar proses pencatatan ditunggu (await)
            await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                    if (err) return resolve(); // Jika token error, abaikan & lanjutkan
                    if (decoded) {
                        try {
                            const userId = decoded.id;
                            // Mencatat atau memperbarui riwayat klik
                            await UserProductViewHistory.upsert({
                                user_id: userId,
                                product_id: req.params.id
                            });
                            resolve();
                        } catch (dbError) {
                            reject(dbError); // Jika database error, hentikan proses
                        }
                    } else {
                        resolve();
                    }
                });
            });
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