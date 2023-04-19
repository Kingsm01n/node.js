const express = require('express');
const multer = require('multer');
const Product = require('../model/product');
const router = express.Router();
const Category = require('../model/category');
const jwt = require('jsonwebtoken');

// Set up multer for file upload
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image file (jpg, jpeg, png)'));
    }
    cb(undefined, true);
  }
});

// Create a new product
router.post('/', upload.single('photo'), async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
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
router.get('/', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
checkAuth(req, res);
  try {
    const categories = await Category.find();
    const products = await Product.find();
    res.render('product', {products,categories});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a product by ID
router.get('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
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
router.patch('/:id', upload.single('photo'), async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
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
router.delete('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
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

    const tokenTemp = token.replace('Bearer ', '')

    const decoded = jwt.verify(tokenTemp, secretKey);
    req.user = decoded;
  } catch (err) {
    console.log(err)
    return res.status(401).render('auth');
  }
}