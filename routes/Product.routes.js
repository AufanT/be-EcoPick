const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

const { verifyToken } = require('../middlewares/authenticate');
const { getUserWithRole, isCustomer,  } = require('../middlewares/authorize');
const { createReviewRules, validate } = require('../middlewares/reviewValidator');

// --- Rute Khusus Terlindungi (Wajib Login) ---
router.get('/recommendations', [verifyToken], controller.getSimilarProductsRecommendation);

// --- Rute Publik (Tidak Perlu Login) ---
router.get('/', controller.getAllProducts);
router.get('/:id', controller.getProductById);
router.get('/categories', controller.getAllCategories);

// --- Rute Terlindungi (Wajib Login) ---
router.post('/:id/reviews', [verifyToken, getUserWithRole, isCustomer, createReviewRules(), validate],
    controller.createReview);

module.exports = router;