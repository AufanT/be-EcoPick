'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await queryInterface.bulkInsert('Users', [
      {
        full_name: 'Admin EcoPick',
        email: 'admin@ecopick.com',
        password_hash: hashedPassword,
        role_id: 1, // admin
        address: 'Jakarta, Indonesia',
        phone_number: '+6281234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: 'John Doe',
        email: 'john@example.com',
        password_hash: hashedPassword,
        role_id: 2, // customer
        address: 'Bandung, Indonesia',
        phone_number: '+6281234567891',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        password_hash: hashedPassword,
        role_id: 2, // customer
        address: 'Surabaya, Indonesia',
        phone_number: '+6281234567892',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};