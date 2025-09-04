const express = require('express');
const router = express.Router();

const { login } = require('../controllers/auth.controller');
const { register } = require('../controllers/auth.controller');
const { registerRules, validate } = require('../middlewares/authValidator')

router.post('/login', login);
router.post('/register', registerRules(), validate, register);

module.exports = router;