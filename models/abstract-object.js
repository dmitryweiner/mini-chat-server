const { generateId } = require('../utils');

class AbstractObject {
  constructor(params = {}) {
    this.id = generateId();
    this.createdAt = new Date();
    for (const field of this.getFields()) {
      if (typeof this[field] === 'undefined') {
        this[field] = params[field];
      }
    }
  }

  hydrate(params) {
    if (!params) return;
    for (const field of this.getFields()) {
      this[field] = params[field];
    }
    return this;
  }

  getFields() {
    return ['id', 'createdAt'];
  }
}

module.exports = AbstractObject;
