const express = require('express');
const router = express.Router();
const controller = require('../controllers/cart.controller');

// Impor middleware yang dibutuhkan
const { verifyToken } = require('../middlewares/authenticate');
const { getUserWithRole, isCustomer } = require('../middlewares/authorize');
const { addToCartRules, updateCartRules, validate } = require('../middlewares/cartValidator');


// Lindungi semua rute keranjang dengan middleware
const authMiddlewares = [verifyToken, getUserWithRole, isCustomer];

// Definisikan endpoint untuk keranjang belanja
router.get('/', authMiddlewares, controller.getCart);
router.post('/', [...authMiddlewares, ...addToCartRules(), validate], controller.addToCart);
router.put('/:productId', [...authMiddlewares, ...updateCartRules(), validate], controller.updateCartItem);
router.delete('/:productId', authMiddlewares, controller.deleteCartItem);

module.exports = router;