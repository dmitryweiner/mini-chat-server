const {generateRandomString} = require('../utils.js');

expect.extend({
  toContainObject(received, argument) {
    const pass = this.equals(received,
      expect.arrayContaining([
        expect.objectContaining(argument)
      ])
    );

    if (pass) {
      return {
        message: () => (`expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`),
        pass: true
      };
    } else {
      return {
        message: () => (`expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`),
        pass: false
      };
    }
  }
});

module.exports = {
  generateRandomUser: () => {
    return {
      nickname: generateRandomString(10),
      password: generateRandomString(10)
    };
  },

  generateRandomChat: () => {
    return {
      title: generateRandomString(10),
      isPrivate: false
    };
  },

  generateRandomMessage: () => {
    return {
      content: generateRandomString(10)
    };
  }
};
