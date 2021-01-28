/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [ true, 'Please tell us your name !' ],
  },
  email: {
    type: String,
    require: [ true, 'Please provide an email' ],
    unique: true,
    lowercase: true,
    validate: [ validator.isEmail, 'Please provide a valid email' ],
  },
  photo: String,
  role: {
    type: String,
    enum: [ 'user', 'guide', 'lead-guide', 'admin' ],
    default: 'user',
  },
  password: {
    type: String,
    required: [ true, 'Please provide a password' ],
    minlenght: 8,
    select: false, // will not show up on any reading output
  },
  passwordConfirm: {
    type: String,
    required: [ true, 'Please confirm your password.' ],
    validate: {
      // This only works on CREATE and SAVE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

//==== Document Midddleware
userSchema.pre('save', async function(next) {
  // Only run this function only if the password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // after successfull validation, passwordConfirm is not useful
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false; // password not changed
};

const User = mongoose.model('User', userSchema);

module.exports = User;
