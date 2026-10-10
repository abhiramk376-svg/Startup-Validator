// Centralized error handler — every controller can just `next(err)` or throw
// inside an async route wrapped with asyncHandler, and it lands here.
export function errorHandler(err, req, res, next) {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'Something went wrong on the server.',
  })
}

// Wrap async route handlers so thrown errors reach errorHandler
// instead of crashing the process.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
