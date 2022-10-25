const cucumber = require('cypress-cucumber-preprocessoræ').default
module.exports = (on, config) => {
  on('file:preprocessor', cucumber())
}