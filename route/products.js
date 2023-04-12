const express = require('express');
const multer = require('multer');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const router = express.Router();

// Set up multer for file upload
const upload = multer({
  limits: {
    fileSize: 1000000 // 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image file (jpg, jpeg, png)'));
    }
    cb(undefined, true);
  }
});

// Create a new product
router.post('/products', upload.single('photo'), async (req, res) => {
checkAuth(req, res);
  const product = new Product({
    ...req.body,
    photo: req.file.buffer
  });
  try {
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all products
router.get('/products', async (req, res) => {
checkAuth(req, res);
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a product by ID
router.get('/products/:id', async (req, res) => {
checkAuth(req, res);
  const _id = req.params.id;
  try {
    const product = await Product.findById(_id);
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a product by ID
router.patch('/products/:id', upload.single('photo'), async (req, res) => {
checkAuth(req, res);
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'description', 'price', 'category'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send();
    }
    updates.forEach((update) => product[update] = req.body[update]);
    if (req.file) {
      product.photo = req.file.buffer;
    }
    await product.save();
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a product by ID
router.delete('/products/:id', async (req, res) => {
checkAuth(req, res);
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
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