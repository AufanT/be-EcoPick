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
    res.json({ 
        message: 'Welcome to API EcoPick',
        status: 'API is running',
        endpoints: {
            docs: '/api-docs',
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            orders: '/api/orders',
            wishlist: '/api/wishlist',
            tracking: '/api/tracking'
        }
    }); 
});

// Perbaikan untuk Swagger - buat fallback jika file tidak ditemukan
let swaggerDocument;
try {
    // Coba load file YAML
    const yamlPath = path.join(process.cwd(), 'dokumentasi-api.yaml');
    swaggerDocument = YAML.load(yamlPath);
    console.log('✅ Swagger document loaded successfully');
} catch (error) {
    console.log('⚠️  Warning: Could not load YAML file, using fallback swagger config');
    // Fallback swagger document jika file tidak ditemukan
    swaggerDocument = {
        openapi: '3.0.0',
        info: {
            title: 'EcoPick API',
            description: 'API dokumentasi untuk aplikasi EcoPick - Platform E-commerce Produk Ramah Lingkungan',
            version: '1.0.0'
        },
        servers: [
            {
                url: 'https://be-eco-pick.vercel.app/api',
                description: 'Production server'
            },
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            }
        ],
        paths: {
            '/': {
                get: {
                    summary: 'API Status',
                    description: 'Check if API is running',
                    responses: {
                        '200': {
                            description: 'API is running successfully'
                        }
                    }
                }
            }
        }
    };
}

// Import routes
const authRoutes = require('./routes/Auth.routes');
const userRoutes = require('./routes/User.routes');
const adminRoutes = require('./routes/Admin.routes');
const productRoutes = require('./routes/Product.routes.js');
const cartRoutes = require('./routes/Cart.routes.js');
const orderRoutes = require('./routes/Order.routes.js');
const wishlistRoutes = require('./routes/Wishlist.routes.js');
const trackingRoutes = require('./routes/Tracking.routes.js');

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "EcoPick API Documentation"
}));

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', [verifyToken, getUserWithRole, isAdmin], adminRoutes);
app.use('/api', productRoutes); // productRoutes sudah mengandung prefix /api/products
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/tracking', trackingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Handle 404 - ganti '*' dengan middleware tanpa path
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        requestedPath: req.originalUrl,
        availableEndpoints: [
            '/api-docs',
            '/api/auth/login',
            '/api/auth/register',
            '/api/products',
            '/api/cart',
            '/api/orders',
            '/api/wishlist',
            '/api/tracking'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});