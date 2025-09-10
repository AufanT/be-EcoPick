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

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));
app.use(express.json());

dotenv.config();

// ... (kode import rute lainnya)
const swaggerDocument = YAML.load(path.join(__dirname, 'dokumentasi-api.yaml'));
const authRoutes = require('./routes/Auth.routes');
const userRoutes = require('./routes/User.routes');
const adminRoutes = require('./routes/Admin.routes');
const productRoutes = require('./routes/Product.routes.js');
const cartRoutes = require('./routes/Cart.routes.js');
const orderRoutes = require('./routes/Order.routes.js');
const wishlistRoutes = require('./routes/Wishlist.routes.js');
const trackingRoutes = require('./routes/Tracking.routes.js');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Setup routes
app.get('/', (req, res) => { res.send('Welcome to the EcoPick API!' );});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', [verifyToken, getUserWithRole, isAdmin], adminRoutes);
app.use('/api', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/tracking', trackingRoutes);

module.exports = app;
