var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var Book = require('../models').Book;

// wraps each route function callback
function asyncHandler(callback) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (error) {
      console.error(`Something went wrong: ${error}`);
      res.status(500).render('error', {headTitle: 'Server Error'});
    }
  }
} 

// custom error constructor class
class InvalidPageError {
  constructor(message) {
    this.name = "InvalidPageError";
    this.message = message;
  }
}

// returns an array of numbers which each number represent a page to create. Ex: array = [1,2,3]
// 10 books to display per page
function getPageArray(total) {
  let pageNumber = 1;
  let array = [];
  for (let i = 0; i < total; i += 10) {
    array.push(pageNumber++);
  }
  return array; 
}

// return true if "pageParameter" number matches any number in array argument
function isValidPageNumber(array, parameter) {
  let pageParameter = parseInt(parameter);
  for (let i = 0; i < array.length; i++) {
    if (pageParameter === array[i]) {
      return true;
    } 
  }
  if (array === []) {
    return true;
  }
  return false;
}

// return true if any object property contains a value
function isCookieAvailable(object) {
  for (let cookie in object) {
    if (cookie !== null) {
      return true;
    }
  }
  return false;
}

/* GET home page. */
router.get('/page=:page?', asyncHandler(async (req, res, next) => {
  let books;
  let bookTotal;
  let pagesArray;
  let validPageBoolean;
  let query = {};
  let options = {
    limit: 10, 
    offset: (req.params.page - 1) * 10, 
    where: {}
  };

  try {
    // retrieve books if cookies exist
    if (isCookieAvailable(req.cookies) === true) {

      for (let cookie in req.cookies) {
        let value = req.cookies[cookie];
        // set "where" properties for "options" object
        options.where[`${cookie}`] = {
          [Op.like]: `%${value}%`
        };
        // query object for index view
        query[`${cookie}`] = `${value}`;
      }

      books = await Book.findAll(options);
      bookTotal = await Book.findAndCountAll(options);
      pagesArray = getPageArray(bookTotal.count);
    } else {
      books = await Book.findAll(options);
      bookTotal = await Book.count();
      pagesArray = getPageArray(bookTotal);
    }
    validPageBoolean = isValidPageNumber(pagesArray, req.params.page);
    console.error(validPageBoolean);
    if (validPageBoolean === false) {
      throw new InvalidPageError('This page is not valid. Please view books.js to view custom error constructor class.');
    }

    // console.error({headTitle: 'Books', title: 'Library', books: books, pagesArray: pagesArray, pageParam: parseInt(req.params.page), query: query});
    res.render("index", {headTitle: 'Books', title: 'Library', books: books, pagesArray: pagesArray, pageParam: parseInt(req.params.page), query: query});
  } catch (error) {
      if (error.name === 'InvalidPageError') {
        console.error(`Something went wrong: ${error.name}: ${error.message}`);
        res.status(404);
        res.render('page-not-found', {headTitle: 'Page Not Found'});
      } else {
        throw error;
      }
  }
}));

/* GET new book form page. */
router.get('/new', asyncHandler(async (req, res, next) => {
  res.render("new-book", {headTitle: 'New Book', title: 'New Book', newBook: {}});
}));

/* POST new book. */
router.post('/new', asyncHandler(async (req, res, next) => {
  let newBook;
  try {
    newBook = await Book.create(req.body);
    res.redirect('/books/page=1');
  }
  catch (error) {
    if (error.name === 'SequelizeValidationError') {
      newBook = await Book.build(req.body);
      res.render('new-book', {title: 'New Book', errors: error.errors, newBook: newBook});
    } else {
      throw error;
    }
  }
}));

/* GET book by id. */
router.get('/:id/update', asyncHandler(async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    res.render('update-book', {headTitle: book.title, title: 'Update Book', book: book});
  } catch (error) {
    throw error;
  }
}));

/* UPDATE book by id. */
router.post('/:id/update', asyncHandler(async (req, res, next) => {
  let book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect('/books/page=1');
}));

/* GET Delete Page */
router.get('/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  res.render('delete-book', {headTitle: 'Delete Book', book: book});
}));

/* DELETE book. */
router.post('/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/books/page=1');
}));

/* GET Search Page */
router.get('/search', asyncHandler(async (req, res, next) => {
  res.render('search-book', {headTitle: 'Search Book', title: 'Search Book', book: {}});
}));

/* POST Search Page */
router.post('/search', asyncHandler(async (req, res, next) => {
  try {
    res.cookie('title', req.body.title);
    res.cookie('author', req.body.author);
    res.cookie('genre', req.body.genre);
    res.cookie('year', req.body.year);
    res.redirect('/books/page=1');
  } catch (error) {
    throw error;
  }
}));

/* POST clearTitle Page */
router.post('/clear/title', asyncHandler(async (req, res, next) => {
  res.clearCookie('title');
  res.redirect('/books/page=1');
}));

/* POST clearAuthor Page */
router.post('/clear/author', asyncHandler(async (req, res, next) => {
  res.clearCookie('author');
  res.redirect('/books/page=1');
}));

/* POST clearGenre Page */
router.post('/clear/genre', asyncHandler(async (req, res, next) => {
  res.clearCookie('genre');
  res.redirect('/books/page=1');
}));

/* POST clearYear Page */
router.post('/clear/year', asyncHandler(async (req, res, next) => {
  res.clearCookie('year');
  res.redirect('/books/page=1');
}));

module.exports = router;