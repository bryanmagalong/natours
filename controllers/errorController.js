module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // default status code
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
