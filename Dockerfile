# 1. Mulai dari image Node.js yang stabil
FROM node:18-alpine

# 2. Setel folder kerja di dalam container
WORKDIR /app

# 3. Salin file package.json dan package-lock.json
# Ini memanfaatkan cache Docker. Jika file ini tidak berubah, 
# Docker tidak akan meng-install ulang dependensi setiap saat.
COPY package.json package-lock.json ./

# 4. Instal semua dependensi (termasuk devDependencies seperti nodemon)
RUN npm install

# 5. Salin sisa file proyek Anda ke dalam container
COPY . .

# 6. Ekspos port yang digunakan aplikasi Anda (dari index.js)
EXPOSE 3000

# 7. Perintah untuk menjalankan aplikasi menggunakan nodemon (dari package.json)
CMD [ "npm", "run", "dev" ]