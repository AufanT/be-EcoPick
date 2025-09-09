const { User, Role } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

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

exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;

        // Ambil user dengan password hash
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ 
                message: 'User tidak ditemukan.' 
            });
        }

        // Verify current password
        const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(400).send({ 
                message: 'Password lama tidak benar.' 
            });
        }

        // Check if new password same as current
        const isSamePassword = bcrypt.compareSync(newPassword, user.password_hash);
        if (isSamePassword) {
            return res.status(400).send({ 
                message: 'Password baru tidak boleh sama dengan password lama.' 
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await user.update({ password_hash: hashedNewPassword });

        res.status(200).send({ 
            message: 'Password berhasil diubah!' 
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).send({ 
            message: "Gagal mengubah password: " + error.message 
        });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        // req.userId didapatkan dari middleware verifyToken
        const userId = req.userId;
        
        // Whitelist fields yang boleh diupdate (untuk keamanan)
        const allowedFields = ['full_name', 'address', 'phone_number'];
        const updateData = {};
        
        // Hanya ambil field yang diizinkan dan ada di request body
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== null) {
                // Trim whitespace untuk string
                updateData[field] = typeof req.body[field] === 'string' 
                    ? req.body[field].trim() 
                    : req.body[field];
            }
        });

        // Cek apakah ada data yang akan diupdate
        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ 
                success: false,
                message: 'Tidak ada data yang diupdate. Minimal satu field harus diisi.' 
            });
        }

        // Cari user berdasarkan ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ 
                success: false,
                message: 'User tidak ditemukan.' 
            });
        }

        // Validasi khusus: cek apakah ada perubahan data
        let hasChanges = false;
        for (const field of Object.keys(updateData)) {
            if (user[field] !== updateData[field]) {
                hasChanges = true;
                break;
            }
        }

        if (!hasChanges) {
            return res.status(200).send({
                success: true,
                message: 'Tidak ada perubahan data yang perlu disimpan.',
                data: await User.findByPk(userId, {
                    attributes: { exclude: ['password_hash'] },
                    include: {
                        model: Role,
                        as: 'role',
                        attributes: ['name'] 
                    }
                })
            });
        }

        // Update user profile
        await user.update(updateData);

        // Ambil data user yang sudah terupdate (tanpa password hash)
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] },
            include: {
                model: Role,
                as: 'role',
                attributes: ['name'] 
            }
        });

        res.status(200).send({
            success: true,
            message: 'Profil berhasil diperbarui!',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(422).json({
                success: false,
                message: 'Validasi data gagal dari database',
                errors: validationErrors
            });
        }
        
        // Handle unique constraint errors (jika ada)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({
                success: false,
                message: 'Data sudah digunakan oleh pengguna lain.'
            });
        }
        
        res.status(500).send({ 
            success: false,
            message: "Terjadi kesalahan saat memperbarui profil: " + error.message 
        });
    }
};