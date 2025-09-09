const { User, Role } = require('../models'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Check JWT_SECRET exists
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

// Fungsi untuk Registrasi User baru
exports.register = async (req, res) => {
    try {
        const { full_name, email, address, phone_number, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).send({ 
                success: false,
                message: "Email sudah terdaftar." 
            });
        }

        // FIXED: Use async hash consistently
        const hashedPassword = await bcrypt.hash(password, 12); // Increase salt rounds

        const role = await Role.findOne({ where: { name: 'customer' } });

        if (!role) {
            return res.status(500).send({ 
                success: false,
                message: "Konfigurasi sistem tidak lengkap." 
            });
        }

        const user = await User.create({
            full_name,
            email,
            password_hash: hashedPassword,
            role_id: role.id,
            address,
            phone_number
        });

        res.status(201).send({ 
            success: true,
            message: 'Pengguna berhasil terdaftar!', 
            data: {
                userId: user.id,
                email: user.email,
                full_name: user.full_name
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({
                success: false,
                message: 'Email sudah terdaftar.'
            });
        }
        
        res.status(500).send({ 
            success: false,
            message: "Terjadi kesalahan saat mendaftarkan pengguna." 
        });
    }
};

// Fungsi untuk Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send({ 
                success: false,
                message: 'Email tidak terdaftar.' 
            });
        }

        // FIXED: Use async compare consistently
        const passwordIsValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).send({
                success: false,
                message: 'Password salah!'
            });
        }

        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } // More explicit
        );

        res.status(200).send({
            success: true,
            message: 'Login berhasil',
            data: {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email
                },
                accessToken: token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ 
            success: false,
            message: "Terjadi kesalahan saat login." 
        });
    }
};