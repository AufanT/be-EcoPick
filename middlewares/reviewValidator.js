const { body, validationResult } = require('express-validator');

const createReviewRules = () => {
    return [
        // Cek apakah rating adalah angka antara 1 dan 5
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus berupa angka antara 1 dan 5.'),
        
        // Cek apakah komentar tidak kosong
        body('comment').notEmpty().withMessage('Komentar wajib diisi.')
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
    createReviewRules,
    validate,
};