const express = require('express');
const Order = require('../model/order');
const User = require('../model/user');
const Product = require('../model/product');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Create a new order
router.post('/', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }

  userId = await getUserIdFromToken(token)
  const products = await Product.findById(req.body.product)
checkAuth(req, res);
  const order = new Order({
    products: {product: products, quantity: 1},
    user: userId,
    status: 'created'
  });
  try {
    await order.save();

    const orders = await Order.findByUserId(userId)
    res.status(201).render("order", { orders });
  } catch (error) {
  console.log(error)
    res.status(400).send(error);
  }
});

// Get all orders for current user
router.get('/', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
checkAuth(req, res);
  try {
  userId = await getUserIdFromToken(token)
  const orders = await Order.findByUserId(userId)
    res.status(201).render("order", { orders });
  } catch (error) {
  console.log(error)
    res.status(400).send(error);
  }
});

// Get an order by ID for current user
router.get('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
checkAuth(req, res);
  const _id = req.params.id;
  try {
    const order = await Order.findOne({ _id, user: req.user._id });
    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update an order by ID for current user
router.patch('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
checkAuth(req, res);
  const updates = Object.keys(req.body);
  const allowedUpdates = ['status'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).send();
    }
    updates.forEach((update) => order[update] = req.body[update]);
    await order.save();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete an order by ID for current user
router.delete('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
checkAuth(req, res);
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
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

function getUserIdFromToken(token) {
const secretKey = 'mysecretkey';

  try {
    const decoded = jwt.verify(token, secretKey);
    return User.findByCredentials(decoded.email, decoded.password);
  } catch (err) {
    console.log(err);
    return null;
  }
}