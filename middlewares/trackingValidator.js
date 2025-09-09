const { body, param, validationResult } = require('express-validator');

const updateTrackingRules = () => {
    return [
        body('status')
            .isIn([
                'pending', 'paid', 'confirmed', 'processing', 
                'packed', 'shipped', 'out_for_delivery', 
                'delivered', 'cancelled', 'returned'
            ])
            .withMessage('Status tidak valid'),
        body('status_description')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Deskripsi status terlalu panjang'),
        body('location')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Lokasi terlalu panjang'),
        body('courier_name')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Nama kurir terlalu panjang'),
        body('tracking_url')
            .optional()
            .isURL()
            .withMessage('URL tracking tidak valid'),
        body('estimated_delivery')
            .optional()
            .isISO8601()
            .withMessage('Format tanggal estimasi tidak valid')
    ];
};

const trackingNumberRules = () => {
    return [
        param('trackingNumber')
            .isLength({ min: 8, max: 20 })
            .withMessage('Format nomor tracking tidak valid')
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return res.status(422).json({ errors: extractedErrors });
};

module.exports = {
    updateTrackingRules,
    trackingNumberRules,
    validate,
};