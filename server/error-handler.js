class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.status = 401;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class NotAllowedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotAllowedError';
    this.status = 403;
  }
}

module.exports = {
  handleError: (res, error) => {
    if (error instanceof AuthError ||
      error instanceof NotAllowedError ||
      error instanceof NotFoundError) {
      return res.status(error.status).json({
        error: error.message
      });
    }

    return res.status(400).json({
      error: error.message
    });
  },
  AuthError,
  NotFoundError,
  NotAllowedError
};
