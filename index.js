const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { verifyToken } = require("./middlewares/authenticate.js");
const { getUserWithRole, isAdmin } = require("./middlewares/authorize.js");
const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();

app.get('/', (req, res) => { 
    res.send('Welcome to the EcoPick API!' );
});

// Import routes
const swaggerDocument = YAML.load(path.join(__dirname, 'dokumentasi-api.yaml'));
const authRoutes = require('./routes/Auth.routes');
const userRoutes = require('./routes/User.routes');
const adminRoutes = require('./routes/Admin.routes');
const productRoutes = require('./routes/Product.routes.js');
const cartRoutes = require('./routes/Cart.routes.js');
const orderRoutes = require('./routes/Order.routes.js');
const wishlistRoutes = require('./routes/Wishlist.routes.js');
const trackingRoutes = require('./routes/Tracking.routes.js');

// Setup Swagger UI dengan konfigurasi khusus untuk Vercel
const swaggerOptions = {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
    ],
    explorer: true,
    swaggerOptions: {
        requestInterceptor: (req) => {
            // Pastikan URL menggunakan HTTPS di production
            if (process.env.NODE_ENV === 'production' && req.url.startsWith('http://')) {
                req.url = req.url.replace('http://', 'https://');
            }
            return req;
        }
    }
};

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument, swaggerOptions));

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', [verifyToken, getUserWithRole, isAdmin], adminRoutes);
app.use('/api', productRoutes); // productRoutes sudah mengandung prefix /api/products
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/tracking', trackingRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});