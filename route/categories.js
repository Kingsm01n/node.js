const express = require('express');
const router = express.Router();
const Category = require('../model/category');
const jwt = require('jsonwebtoken');

// Create a new category
router.post('/', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
  checkAuth(req, res);
  const category = new Category(req.body);
  try {
    await category.save();

    const categories = await Category.find();
    res.status(201).render("category", {categories, category});
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all categories
router.get('/', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
  checkAuth(req, res);
  try {
    const categories = await Category.find({});
    res.status(200).render("category", {categories});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a specific category by ID
router.get('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
  checkAuth(req, res);
  const _id = req.params.id;
  try {
    const category = await Category.findById(_id);
    if (!category) {
      return res.status(404).send();
    }
    res.send(category);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a specific category by ID
router.patch('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
  checkAuth(req, res);
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }
  const _id = req.params.id;
  try {
    const category = await Category.findById(_id);
    if (!category) {
      return res.status(404).send();
    }
    updates.forEach((update) => category[update] = req.body[update]);
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a specific category by ID
router.delete('/:id', async (req, res) => {
const token = req.cookies.authToken;
  if (token) {
    // добавляем токен в заголовок Authorization для всех запросов
    req.headers.authorization = 'Bearer ' + token;
  }
  checkAuth(req, res);
  const _id = req.params.id;
  try {
    const category = await Category.findByIdAndDelete(_id);
    if (!category) {
      return res.status(404).send();
    }
    res.send(category);
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
