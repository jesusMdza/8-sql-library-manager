// return true if "pageParameter" number matches any number in array argument
function isValidPageNumber(array, parameter) {
  let pageParameter = parseInt(parameter);
  for (let i = 0; i < array.length; i++) {
    if (pageParameter === array[i]) {
      return true;
    } 
  }
  return false;
}

module.exports = isValidPageNumber;