const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');

// Impor middleware yang dibutuhkan
const { verifyToken } = require('../middlewares/authenticate');
const { getUserWithRole, isCustomer } = require('../middlewares/authorize');

// Lindungi semua rute pesanan
const orderMiddlewares = [verifyToken, getUserWithRole, isCustomer];

// Definisikan endpoint untuk pesanan
router.post('/checkout', orderMiddlewares, controller.checkout);
router.get('/', orderMiddlewares, controller.getOrderHistory);
router.get('/:id', orderMiddlewares, controller.getOrderById);

module.exports = router;