export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const error = {
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(err.statusCode || 500).json(error);
};

export const notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
};