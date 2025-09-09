const { body, validationResult } = require('express-validator');

const changePasswordRules = () => {
    return [
        // Current password tidak boleh kosong
        body('currentPassword')
            .notEmpty()
            .withMessage('Password lama wajib diisi.')
            .isLength({ min: 1 })
            .withMessage('Password lama tidak boleh kosong.'),

        // New password validasi
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('Password baru minimal 6 karakter.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password baru harus mengandung huruf kecil, huruf besar, dan angka.')
            .custom((value, { req }) => {
                // Check if new password different from current
                if (value === req.body.currentPassword) {
                    throw new Error('Password baru harus berbeda dari password lama.');
                }
                return true;
            }),

        // Confirm password validation
        body('confirmPassword')
            .notEmpty()
            .withMessage('Konfirmasi password wajib diisi.')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Konfirmasi password tidak cocok dengan password baru.');
                }
                return true;
            })
    ];
};

const updateProfileRules = () => {
    return [
        // Full name validation
        body('full_name')
            .optional() // Field ini optional (boleh tidak ada di request)
            .notEmpty()
            .withMessage('Nama tidak boleh kosong jika diisi.')
            .isLength({ min: 2, max: 100 })
            .withMessage('Nama harus antara 2-100 karakter.')
            .matches(/^[a-zA-Z\s.'-]+$/)
            .withMessage('Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung.')
            .custom((value) => {
                // Cek apakah nama tidak hanya spasi
                if (value && value.trim().length === 0) {
                    throw new Error('Nama tidak boleh hanya berisi spasi.');
                }
                // Cek apakah tidak ada spasi berlebihan
                if (value && /\s{2,}/.test(value)) {
                    throw new Error('Nama tidak boleh mengandung spasi berlebihan.');
                }
                return true;
            }),
            
        // Address validation
        body('address')
            .optional() // Field ini optional
            .notEmpty()
            .withMessage('Alamat tidak boleh kosong jika diisi.')
            .isLength({ min: 10, max: 500 })
            .withMessage('Alamat harus antara 10-500 karakter.')
            .custom((value) => {
                if (value && value.trim().length < 10) {
                    throw new Error('Alamat minimal 10 karakter setelah menghilangkan spasi.');
                }
                return true;
            }),
            
        // Phone number validation untuk format Indonesia
        body('phone_number')
            .optional() // Field ini optional
            .notEmpty()
            .withMessage('Nomor telepon tidak boleh kosong jika diisi.')
            .matches(/^(\+62|62|0)[0-9]{9,13}$/)
            .withMessage('Format nomor telepon tidak valid. Gunakan format: 0812xxxxxxxx, 62812xxxxxxxx, atau +62812xxxxxxxx')
            .isLength({ min: 10, max: 15 })
            .withMessage('Nomor telepon harus antara 10-15 digit.')
            .custom((value) => {
                // Normalisasi nomor telepon
                if (value) {
                    let normalized = value.replace(/\D/g, ''); // Hapus non-digit
                    
                    // Cek format yang valid
                    if (normalized.startsWith('62')) {
                        // Format +62 atau 62
                        if (normalized.length < 12 || normalized.length > 15) {
                            throw new Error('Nomor telepon dengan kode 62 harus 12-15 digit.');
                        }
                    } else if (normalized.startsWith('0')) {
                        // Format 0
                        if (normalized.length < 11 || normalized.length > 13) {
                            throw new Error('Nomor telepon dengan awalan 0 harus 11-13 digit.');
                        }
                    } else {
                        throw new Error('Format nomor telepon tidak valid.');
                    }
                }
                return true;
            }),

        // Email validation (bonus - jika ingin tambah update email)
        body('email')
            .optional()
            .isEmail()
            .withMessage('Format email tidak valid.')
            .normalizeEmail()
            .isLength({ max: 255 })
            .withMessage('Email terlalu panjang (maksimal 255 karakter).')
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // Jika tidak ada error, lanjut ke controller
    }

    // Jika ada error, format dan kirim respons
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ 
        field: err.path, 
        message: err.msg 
    }));

    return res.status(422).json({
        success: false,
        message: 'Validasi gagal',
        errors: extractedErrors,
    });
};

module.exports = {
    changePasswordRules,
    updateProfileRules,
    validate,
};