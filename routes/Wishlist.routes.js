const express = require('express');
const router = express.Router();
const controller = require('../controllers/wishlist.controller');

// Import middleware yang dibutuhkan
const { verifyToken } = require('../middlewares/authenticate');
const { getUserWithRole, isCustomer } = require('../middlewares/authorize');
const { addToWishlistRules, validate } = require('../middlewares/wishlistValidator');

// Lindungi semua rute wishlist dengan middleware
const authMiddlewares = [verifyToken, getUserWithRole, isCustomer];

// Definisikan endpoint untuk wishlist
router.get('/', authMiddlewares, controller.getWishlist);
router.post('/', [...authMiddlewares, ...addToWishlistRules(), validate], controller.addToWishlist);
router.delete('/:productId', authMiddlewares, controller.removeFromWishlist);
router.get('/check/:productId', authMiddlewares, controller.checkWishlistStatus);

module.exports = router;
