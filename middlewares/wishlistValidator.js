const { body, validationResult } = require('express-validator');

// Aturan untuk menambah ke wishlist
exports.addToWishlistRules = () => {
    return [
        body('product_id')
            .isInt({ min: 1 })
            .withMessage('ID Produk harus berupa angka yang valid.')
    ];
};

exports.validate = (req, res, next) => {
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