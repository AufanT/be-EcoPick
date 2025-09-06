const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

const { verifyToken } = require('../middlewares/authenticate');
const { getUserWithRole, isCustomer,  } = require('../middlewares/authorize');
const { createReviewRules, validate } = require('../middlewares/reviewValidator');

// --- Rute Khusus Terlindungi (Wajib Login) ---
router.get('/products/recommendations', [verifyToken], controller.getSimilarProductsRecommendation);

// --- Rute Publik (Tidak Perlu Login) ---
// router.get('/categories', controller.getAllCategories);
router.get('/products', [verifyToken], controller.getAllProducts);
router.get('/products/:id', [verifyToken], controller.getProductById);

// --- Rute Terlindungi (Wajib Login) ---
router.post('/products/:id/reviews', [verifyToken, getUserWithRole, isCustomer, createReviewRules(), validate],
    controller.createReview);

module.exports = router;