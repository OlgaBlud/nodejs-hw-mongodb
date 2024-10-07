import createHttpError from 'http-errors';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: createHttpError(404, 'Route not found'),
  });
};
