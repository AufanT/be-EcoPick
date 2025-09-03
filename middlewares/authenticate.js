const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    let authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).send({ message: 'Tidak ada token yang diberikan atau format salah!' });
    }

    let token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send({ message: 'Akses ditolak! Token sudah kedaluwarsa.' });
            }
            return res.status(401).send({ message: 'Akses ditolak! Token tidak valid.' });
        }
        req.userId = decoded.id;
        next();
    });
};