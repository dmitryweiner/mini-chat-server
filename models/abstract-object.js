const { generateId } = require('../utils');

class AbstractObject {
  constructor(params = {}) {
    this.id = generateId();
    this.createdAt = new Date();
  }

  hydrate(params) {
    if (!params) return;
    for (const field of Object.getOwnPropertyNames(this)) {
      this[field] = params[field];
    }
    return this;
  }
}

module.exports = AbstractObject;
