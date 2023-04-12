const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/mydb', { useNewUrlParser: true });

const Product = require('./model/product');
const Category = require('./model/category');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MongoDB connected');
});

app.listen(3000, function() {
  console.log('Server started');
});

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  const products = await Product.find();
  const categories = await Category.find();
  res.render('index', { products, categories });
});
