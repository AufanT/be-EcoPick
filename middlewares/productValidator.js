const { body, validationResult } = require('express-validator');


const VALID_ML_CATEGORIES = [
    'Beauty', 
    'Food & Beverage', 
    'Office Supplies', 
    'Electronics', 
    'Fashion', 
    'Household'
];

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
        body('is_eco_friendly_admin').isBoolean().withMessage('Status Admin harus boolean (true/false).'),
        body('main_material').notEmpty().withMessage('Jenis bahan utama wajib diisi.'),
        body('is_biodegradable').isBoolean().withMessage('Nilai biodegradable harus true atau false.'),
        body('recycled_content').optional().isInt({ min: 0, max: 100 }).withMessage('Persentase daur ulang harus antara 0 dan 100.'),
        body('packaging_type').notEmpty().withMessage('Jenis kemasan wajib diisi.'),
        body('is_reusable').isBoolean().withMessage('Nilai reusable harus true atau false.'),
        body('has_eco_certification').isBoolean().withMessage('Nilai sertifikasi harus true atau false.'),
        body('ml_category')
            .notEmpty().withMessage('Kategori untuk ML wajib diisi.')
            .isIn(VALID_ML_CATEGORIES).withMessage('Kategori ML tidak valid.')
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