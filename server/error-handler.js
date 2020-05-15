class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
    this.status = 401;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}

module.exports = {
  handleError: (res, error) => {
    if (error instanceof AuthError
      || error instanceof NotFoundError) {
      return res.status(error.status).json({
        error: error.message
      });
    }

    return res.status(400).json({
      error: error.message
    });
  },

  AuthError,

  NotFoundError

};
