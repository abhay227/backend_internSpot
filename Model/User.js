const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  uid:{
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  photo: String, // URL for user's profile photo
  createdAt: {
    type: Date,
    default: Date.now
  },
  subscription: {
    id: String,
    status: {
      type: String,
      default: 'inactive'
    },
    plan: {
      type: String,
      enum: ['Free', 'bronze', 'silver', 'gold'],
      default: 'bronze'
    }
  }  
});

const User = mongoose.model('User', userSchema);

module.exports = User;
