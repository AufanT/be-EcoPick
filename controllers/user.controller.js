const { User, Role } = require('../models');

// Fungsi untuk mendapatkan profil pengguna yang sedang login
exports.getUserProfile = async (req, res) => {
    try {
        // req.userId didapatkan dari middleware verifyToken
        const userId = req.userId;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] },
            include: {
                model: Role,
                as: 'role',
                attributes: ['name'] 
            }
        });

        if (!user) {
            return res.status(404).send({ message: 'Pengguna tidak ditemukan.' });
        }

        res.status(200).send(user);

    } catch (error) {
        res.status(500).send({ message: error.message || "Terjadi kesalahan saat mengambil profil pengguna." });
    }
};