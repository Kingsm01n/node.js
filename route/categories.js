const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const auth = require('../middleware/auth');

// Create a new category
router.post('/categories', auth, async (req, res) => {
  const category = new Category(req.body);
  try {
    await category.save();

    const categories = Category.find();
    res.status(201).render("categories", {categories, category});
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.send(categories);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a specific category by ID
router.get('/categories/:id', auth, async (req, res) => {
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
router.patch('/categories/:id', auth, async (req, res) => {
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
router.delete('/categories/:id', auth, async (req, res) => {
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
