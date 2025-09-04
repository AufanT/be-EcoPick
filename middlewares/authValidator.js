// middlewares/authValidator.js
const { body, validationResult } = require('express-validator');

// Aturan validasi untuk endpoint register
const registerRules = () => {
    return [
        // full_name tidak boleh kosong
        body('full_name').notEmpty().withMessage('Nama lengkap wajib diisi.'),

        // email harus berformat email yang valid
        body('email').isEmail().withMessage('Format email tidak valid.'),

        // password minimal 6 karakter
        body('password').isLength({ min: 6 }).withMessage('Password minimal harus 6 karakter.'),

        // address tidak boleh kosong
        body('address').notEmpty().withMessage('Alamat wajib diisi.'),

        // phone_number tidak boleh kosong
        body('phone_number').notEmpty().withMessage('Nomor telepon wajib diisi.').isNumeric().withMessage('Nomor telepon harus berupa angka.')
    ];    
};

// Fungsi untuk mengecek hasil validasi
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // Jika tidak ada error, lanjut ke controller
    }

  // Jika ada error, format dan kirim respons
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
    });
};

module.exports = {
    registerRules,
    validate,
};