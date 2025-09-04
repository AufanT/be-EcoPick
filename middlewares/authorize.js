// middlewares/authorize.js (Versi Final yang Benar)

const db = require('../models');
const User = db.User;
const Role = db.Role;

// Middleware 1: Mengambil data user beserta rolenya
const getUserWithRole = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(403).send({ message: "Akses ditolak! ID Pengguna tidak ada." });
        }
        
        const user = await User.findByPk(req.userId, { 
            include: {
                model: Role,
                as: 'role'
            } 
        });

        if (!user || !user.role) {
            return res.status(403).send({ message: 'Akses ditolak! Data peran tidak valid atau pengguna tidak ditemukan.' });
        }
        
        req.user = user;
        next();

    } catch (error) {
        console.error("Error di middleware getUserWithRole:", error);
        res.status(500).send({ message: "Terjadi kesalahan saat mengambil data pengguna." });
    }
};

// Middleware 2: Memeriksa peran 'admin'
const isAdmin = (req, res, next) => {
    // DIUBAH: Memeriksa peran 'admin'
    if (req.user.role.name === 'admin') {
        next();
        return;
    }
    // DIUBAH: Pesan error
    res.status(403).send({ message: 'Akses ditolak! Membutuhkan peran Admin.' });
};

// Middleware 3: Memeriksa peran 'customer'
const isCustomer = (req, res, next) => {
    // DIUBAH: Memeriksa peran 'customer'
    if (req.user.role.name === 'customer') {
        next();
        return;
    }
    // DIUBAH: Pesan error
    res.status(403).send({ message: 'Akses ditolak! Membutuhkan peran Customer.' });
};

const authorize = {
    getUserWithRole,
    isAdmin,
    isCustomer,
};

module.exports = authorize;