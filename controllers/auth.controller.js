const { User, Role } = require('../models'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk Registrasi User baru
exports.register = async (req, res) => {
    try {
        const { full_name, email, address, phone_number, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Cari role 'customer' di database
        const role = await Role.findOne({ where: { name: 'customer' } });

        if (!role) {
            return res.status(500).send({ message: "Role 'customer' tidak ditemukan. Harap seed database Anda." });
        }

        // Buat user baru
        const user = await User.create({
            full_name,
            email,
            password_hash: hashedPassword,
            role_id: role.id,
            address,
            phone_number
        });

        res.status(201).send({ message: 'Pengguna berhasil terdaftar!', userId: user.id });

    } catch (error) {
        res.status(500).send({ message: error.message || "Terjadi kesalahan saat mendaftarkan pengguna." });
    }
};

// Fungsi untuk Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send({ message: 'Pengguna tidak ditemukan.' });
        }

        // Bandingkan password yang diinput dengan yang ada di database
        const passwordIsValid = bcrypt.compareSync(
            password,
            user.password_hash
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: 'Password salah!'
            });
        }

        // Jika valid, buat token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 jam
        });

        res.status(200).send({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            accessToken: token
        });

    } catch (error) {
        res.status(500).send({ message: error.message || "Terjadi kesalahan saat login." });
    }
};