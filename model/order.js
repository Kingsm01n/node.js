const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now()
  }
});

orderSchema.virtual('total').get(function() {
  let sum = 0;
  for (let i = 0; i < this.products.length; i++) {
    sum += this.products[i].product.price * this.products[i].quantity;
  }
  return sum;
});

orderSchema.statics.findByUserId = async (userId) => {
  const orders = await Order.find({ user: userId }).exec();
  return orders;
}

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
