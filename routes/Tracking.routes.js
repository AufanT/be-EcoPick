const express = require('express');
const router = express.Router();
const controller = require('../controllers/tracking.controller');
const { verifyToken } = require('../middlewares/authenticate');
const { getUserWithRole, isAdmin, isCustomer } = require('../middlewares/authorize');
const { updateTrackingRules, trackingNumberRules, validate } = require('../middlewares/trackingValidator');

// Public tracking (tidak perlu login)
router.get('/:trackingNumber', trackingNumberRules(), validate, controller.trackOrder);

// Customer tracking (perlu login sebagai customer)
router.get('/my-orders/:id', [verifyToken, getUserWithRole, isCustomer], controller.getMyOrderTracking);

// Admin tracking update (perlu login sebagai admin)
router.post('/admin/orders/:id/update', 
    [verifyToken, getUserWithRole, isAdmin, updateTrackingRules(), validate], 
    controller.updateOrderTracking
);

module.exports = router;