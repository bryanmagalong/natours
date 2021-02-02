/* eslint-disable prettier/prettier */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Defining JWT cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // cookie cannot be accessed/modified in any way by the browser
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // cookie will be sent only on an encrypted connexion(https)

  res.cookie('jwt', token, cookieOptions);

  // Remove the password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // Creates a jwt token
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists and password is correct
  // select('+password') allows to get the password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password!'), 401);
  }
  // 3) If everything is ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Get token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );

  // 2) Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exists!',
        401,
      ),
    );

  // 4) Check if the user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! Please log in again!', 401),
    );

  // Grant access to protected route
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  // since restrictTo is called after protect
  // req.user is available
  if (!roles.includes(req.user.role))
    return next(
      new AppError('You do not have permission to perform this action', 403),
    );

  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is no user with this email address!', 404));

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // validateBeforeSave: false will prevent every validators verification
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const host = req.get('host');
  const resetURL = `${req.protocol}://${host}/api/users/resetPassword/${resetToken}`;
  // console.log(resetURL);
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'An error has occured while sending the email. Try again later!',
      ),
      500,
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is a user, set the new password
  if (!user) return next(new AppError('Token is invalid or has expired'), 400);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // we don't turn off the validator here since we need to validate the password

  // 3) Update changedPassword property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  // Since we are in a protected route, we have access to the user id in req.user.id
  // which is defined in protect()
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if the posted password is correct
  if (!await user.correctPassword(req.body.passwordCurrent, user.password))
    return next(new AppError('Your current password is wrong!'), 401);

  // 3) If password is correct, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
