const { generateId } = require('../utils');

class AbstractObject {
  constructor(params) {
    this.id = generateId();
    this.creationDate = new Date();
    for (const field in params) {
      if (typeof this[field] === 'undefined') {
        this[field] = params[field];
      }
    }
  }

  hydrate(params) {
    if (!params) return;
    for (const field in params) {
      this[field] = params[field];
    }
    return this;
  }
}

module.exports = AbstractObject;
