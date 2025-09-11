const axios = require('axios');

const ML_API_URL = 'https://nama-domain-api-ml-anda.com/predict';

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
    const response = await axios.post(ML_API_URL, payload);

    const predictionResult = response.data.eco_friendly; 
    
    console.log("Hasil prediksi dari ML:", predictionResult);

    return predictionResult === true;

  } catch (error) {
    console.error("Gagal saat memanggil API Machine Learning:", error.message);
    
    return false;
  }
};