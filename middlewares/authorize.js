const db = require('../models');
const User = db.User;
const Role = db.Role;

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId, { include: [Role] });

        if (!user || !user.Role) {
            return res.status(403).send({ message: 'Akses ditolak! Data peran tidak valid.' });
        }
        
        if (user.Role.name === 'dosen') {
            req.user = user;
            next();
            return;
        }

        res.status(403).send({ message: 'Membutuhkan peran Dosen!' });
    } catch (error) {
        console.error("ERROR di middleware isDosen:", error);
        res.status(500).send({ message: 'Terjadi kesalahan saat verifikasi peran Dosen.' });
    }
};

const isCustomer = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId, { include: [Role] });

        console.log("DATA USER DARI MIDDLEWARE:", JSON.stringify(user, null, 2));

        if (!user || !user.Role) {
            return res.status(403).send({ message: 'Akses ditolak! Data peran tidak valid.' });
        }

        if (user.Role.name === 'mahasiswa') {
            req.user = user;
            next();
            return;
        }
        res.status(403).send({ message: 'Membutuhkan peran Mahasiswa!' });
    } catch (error) {
        console.error("ERROR di middleware isMahasiswa:", error);
        res.status(500).send({ message: 'Terjadi kesalahan saat verifikasi peran Mahasiswa.' });
    }
};

const getUserWithRole = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId, { include: [Role] });

        if (!user) {
            return res.status(404).send({ message: "User tidak ditemukan." });
        }

        if (!user.Role) {
            console.error(`User dengan ID ${req.userId} tidak memiliki role yang valid.`);
            return res.status(500).send({ message: 'Kesalahan konfigurasi: Data peran pengguna tidak ditemukan.' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error("Error di middleware getUserWithRole:", error);
        res.status(500).send({ message: "Terjadi kesalahan saat mengambil data user." });
    }
};

const authorize = {
    isAdmin,
    isCustomer,
    getUserWithRole
};

module.exports = authorize;