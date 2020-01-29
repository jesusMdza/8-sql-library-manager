// return true if any object property contains a value
function isCookieAvailable(object) {
  for (let cookie in object) {
    if (cookie !== null) {
      return true;
    }
  }
  return false;
}

module.exports = isCookieAvailable;