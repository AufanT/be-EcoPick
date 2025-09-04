// middlewares/cartValidator.js
const { body, validationResult } = require('express-validator');

// Aturan untuk MENAMBAH item ke keranjang (POST)
const addToCartRules = () => {
    return [
        body('product_id').isInt({ min: 1 }).withMessage('ID Produk tidak valid.'),
        body('quantity').isInt({ min: 1 }).withMessage('Kuantitas minimal harus 1.')
    ];
};

// Aturan untuk MENGUPDATE item di keranjang (PUT)
const updateCartRules = () => {
    return [
        // Kuantitas minimal 1. Jika 0, seharusnya item dihapus.
        body('quantity').isInt({ min: 1 }).withMessage('Kuantitas minimal harus 1.')
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return res.status(422).json({
        errors: extractedErrors,
    });
};

module.exports = {
    addToCartRules,
    updateCartRules,
    validate,
};