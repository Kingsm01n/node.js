const express = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new order
router.post('/orders', async (req, res) => {
checkAuth(req, res);
  const order = new Order({
    ...req.body,
    user: req.user._id,
    status: 'created'
  });
  try {
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all orders for current user
router.get('/orders', async (req, res) => {
checkAuth(req, res);
  try {
    await req.user.populate('orders').execPopulate();
    res.send(req.user.orders);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get an order by ID for current user
router.get('/orders/:id', async (req, res) => {
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
router.patch('/orders/:id', async (req, res) => {
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
router.delete('/orders/:id', async (req, res) => {
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
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
  } catch (err) {
    return res.status(401).render('auth');
  }
}