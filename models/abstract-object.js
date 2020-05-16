const { generateId } = require('../utils');

class AbstractObject {
  constructor(params) {
    this.id = generateId();
    this.creationDate = new Date();
  }
}

module.exports = AbstractObject;
