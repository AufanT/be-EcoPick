const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const { createProductRules, validate } = require('../middlewares/productValidator');
const upload = require('../middlewares/upload');

// --- Routes untuk Produk ---
router.get('/products', controller.getAllProducts);
router.post('/products', upload.single('image'), createProductRules(), validate, controller.createProduct);
router.get('/products/:id', controller.getProductById);
router.put('/products/:id', upload.single('image'), controller.updateProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

// --- Routes untuk Kategori ---
router.get('/categories', controller.getAllCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

// --- Routes untuk Pesanan ---
router.get('/orders', controller.getAllOrders);
router.get('/orders/:id', controller.getOrderById);
// router.patch('/orders/:id', controller.updateOrderStatus);

// --- Routes untuk Pengguna ---
router.get('/users', controller.getAllUsers);
router.get('/users/:id', controller.getUserById);
router.put('/users/:id', controller.updateUser);

module.exports = router;