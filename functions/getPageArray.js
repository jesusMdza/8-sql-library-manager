// returns an array of numbers which each number represent a page to create. Ex: array = [1,2,3]
// 10 books to display per page
function getPageArray(total) {
  let pageNumber = 1;
  let array = [];
  for (let i = 0; i < total; i += 10) {
    array.push(pageNumber++);
  }
  if (array.length === 0) {
    array = [1];
    return array;
  }
  return array;
}

module.exports = getPageArray;