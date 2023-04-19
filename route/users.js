const express = require('express');
const User = require('../model/user');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../model/product');
const Category = require('../model/category');

// Register a new user
router.post('/register', async (req, res) => {
  console.log(req)
  try {
    const user = new User(req.body);
    await user.save();
    const token = await generateToken(req.body);
    res.set('Authorization', 'Bearer ${token}');
    res.status(201).redirect('/');
  } catch (error) {
    console.log(error)
    res.status(400).render('register');
  }
});

router.get('/register', async (req, res) => {
    res.render('register');
});

// Login an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await generateToken(req.body);
    res.set('Authorization', 'Bearer ' + token);
    res.cookie('authToken', token, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});

// Logout a user from current session
router.post('/logout', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
  checkAuth(req, res)

  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;


function checkAuth(req, res) {
  const secretKey = 'mysecretkey';

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).render('auth');
  }
  try {

    const tokenTemp = token.replace('Bearer ', '')

    const decoded = jwt.verify(tokenTemp, secretKey);
    req.user = decoded;
  } catch (err) {
    console.log(err)
    return res.status(401).render('auth');
  }
}

function generateToken(payload) {
  const secret = 'mysecretkey'; // секретный ключ, которым подписывается токен
  const token = jwt.sign(payload, secret, { expiresIn: '1h' }); // генерируем токен с заданным временем жизни
  return token;
}