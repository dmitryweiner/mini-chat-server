const nanoid = require('nanoid');

/**
 * @class AbstractObject
 * @abstract
 */
class AbstractObject {
  constructor(params = {}) {
    this.id = nanoid.nanoid();
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
