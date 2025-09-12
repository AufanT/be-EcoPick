const axios = require('axios');

const PRODUCT_ML_API_URL = 'https://nama-domain-api-ml-anda.com/predict';
const REVIEW_ML_API_URL = 'https://nama-domain-api-ml-anda.com/predict-sentiment'; 


/**
 * Mengirim data produk ke API Machine Learning untuk mendapatkan prediksi.
 * @param {object} productData - Data produk yang akan dianalisis.
 * @returns {Promise<boolean>} - Mengembalikan true jika produk eco-friendly, false jika tidak.
 */
exports.predictEcoFriendly = async (productData) => {
  const payload = { 
    kategori_produk:       productData.ml_category,
    product_name:          productData.name, 
    material:              productData.main_material,
    biodegradable:         productData.is_biodegradable,
    recycled_content:      productData.recycled_content,
    packaging_type:        productData.packaging_type,
    reusable:              productData.is_reusable,
    eco_certification:     productData.has_eco_certification,
  };

  console.log("Mengirim payload ke API ML:", payload);

  try {
    const response = await axios.post(PRODUCT_ML_API_URL, payload);

    const predictionResult = response.data.eco_friendly; 
    
    console.log("Hasil prediksi dari ML:", predictionResult);

    return predictionResult === true;

  } catch (error) {
    console.error("Gagal saat memanggil API Machine Learning:", error.message);
    
    return false;
  }
};

/**
 * Mengirim data ulasan lengkap ke API Machine Learning untuk prediksi sentimen.
 * @param {object} reviewData - Objek yang berisi data ulasan.
 * @param {number} reviewData.product_id - ID dari produk yang diulas.
 * @param {string} reviewData.product_name - Nama dari produk yang diulas.
 * @param {number} reviewData.rating - Rating yang diberikan (1-5).
 * @param {string} reviewData.comment - Teks komentar dari ulasan.
 * @returns {Promise<string>} - Mengembalikan sentimen ('positive', 'negative', 'neutral').
 */
exports.predictReviewSentiment = async (reviewData) => {
  const payload = {
    id: reviewData.product_id,
    product_name: reviewData.product_name,
    rating: reviewData.rating,
    review: reviewData.comment 
  };

  console.log("Mengirim payload ke API Sentiment ML:", payload);

  try {
    const response = await axios.post(REVIEW_ML_API_URL, payload);

    // Sesuaikan 'response.data.sentiment' dengan respons aktual dari API
    const sentimentResult = response.data.sentiment; 
    
    console.log("Hasil prediksi sentimen dari ML:", sentimentResult);

    // Pastikan nilai yang dikembalikan cocok dengan ENUM di database
    if (['positive', 'negative', 'neutral'].includes(sentimentResult)) {
        return sentimentResult;
    }
    
    return null; // Kembalikan null jika hasilnya tidak valid

  } catch (error) {
    console.error("Gagal saat memanggil API Sentiment ML:", error.message);
    return null; 
  }
};