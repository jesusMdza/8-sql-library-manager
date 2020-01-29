// custom error constructor class
class InvalidPageError {
  constructor(message) {
    this.name = "InvalidPageError";
    this.message = message;
  }
}

module.exports = InvalidPageError;