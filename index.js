const express = require('express');
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express'); 
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./dokumentasi-api.yaml');
const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();

app.get('/', (req, res) => {
        res.send('Welcome to API EcoPick')
    })

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});