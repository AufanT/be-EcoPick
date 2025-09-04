const { body, validationResult } = require('express-validator');

const createProductRules = () => {
    return [
        body('name').notEmpty().withMessage('Nama produk wajib diisi.'),
        body('category_id').isInt({ min: 1 }).withMessage('ID Kategori tidak valid.'),
        body('description').notEmpty().withMessage('Deskripsi wajib diisi.'),
        body('price').isDecimal({ decimal_digits: '2' }).withMessage('Harga harus berupa angka desimal.'),
        body('stock_quantity').isInt({ min: 0 }).withMessage('Stok harus berupa angka.'),
        body('image_url').isURL().withMessage('URL Gambar tidak valid.'),
        body('materials').isArray({ min: 1 }).withMessage('Bahan produk harus diisi.'),
        body('origin').notEmpty().withMessage('Asal produk wajib diisi.'),
        body('is_eco_friendly_ml').isBoolean().withMessage('Status ML harus boolean (true/false).'),
        body('is_eco_friendly_admin').isBoolean().withMessage('Status Admin harus boolean (true/false).')
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
    createProductRules,
    validate,
};