const { generateId } = require('../utils');

class AbstractObject {
  constructor(params) {
    this.id = generateId();
  }
}

module.exports = AbstractObject;
