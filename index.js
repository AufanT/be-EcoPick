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

// CORS configuration yang lebih permissive untuk Swagger
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
dotenv.config();

app.get('/', (req, res) => { 
    res.send('Welcome to the EcoPick API!' );
});

// Simple API test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'EcoPick API is working!',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth/login',
            products: '/api/products',
            documentation: '/api-docs'
        }
    });
});

// Load swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'dokumentasi-api.yaml'));

// Dynamic server URL update
const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://be-eco-pick.vercel.app' 
    : 'http://localhost:3000';

// Update servers di swagger document
swaggerDocument.servers = [
    {
        url: `${baseUrl}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
];

// Import routes
const authRoutes = require('./routes/Auth.routes');
const userRoutes = require('./routes/User.routes');
const adminRoutes = require('./routes/Admin.routes');
const productRoutes = require('./routes/Product.routes.js');
const cartRoutes = require('./routes/Cart.routes.js');
const orderRoutes = require('./routes/Order.routes.js');
const wishlistRoutes = require('./routes/Wishlist.routes.js');
const trackingRoutes = require('./routes/Tracking.routes.js');

// Setup API routes SEBELUM swagger
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', [verifyToken, getUserWithRole, isAdmin], adminRoutes);
app.use('/api', productRoutes); // productRoutes sudah mengandung prefix /api/products
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/tracking', trackingRoutes);

// Setup Swagger UI dengan konfigurasi yang fix CORS issue
const swaggerOptions = {
    swaggerOptions: {
        requestInterceptor: (request) => {
            // Pastikan request menggunakan URL yang benar
            console.log('Swagger request:', request.url);
            return request;
        },
        responseInterceptor: (response) => {
            // Log response untuk debugging
            console.log('Swagger response:', response.status, response.url);
            return response;
        },
        persistAuthorization: true,
        tryItOutEnabled: true
    }
};

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument, swaggerOptions));

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});