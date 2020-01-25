var express = require('express');
var router = express.Router();
var Book = require('../models').Book;

// wraps each route function callback
function asyncHandler(callback) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (error) {
      console.error('Something happened: ' + error);
      res.status(500).render('error', {headTitle: 'Server Error'});
    }
  }
} 

// custom error constructor function
function InvalidPageError(message) {
  this.name = "InvalidPageError";
  this.message = message;
}

// returns an array of numbers which each represent a page to create. Ex: [1,2,3]
// 10 books to display per page
function getTotalPages(total) {
  let pageNumber = 1;
  let array = [];
  for (let i = 0; i < total; i += 10) {
    array.push(pageNumber++);
  }
  return array; 
}

// compares "pageParam" number with the numbers in "array" and returns boolean
function isValidPageNumber(array, pageParam) {
  for (let i = 0; i < array.length; i++) {
    if (pageParam === array[i]) {
      return true;
    }
  }
  return false;
}

/* GET home page. */
router.get('/page=:page', asyncHandler(async (req, res, next) => {
  let boolean;
  try {
    // req.flash('notify', 'This is a test notification');
    const bookTotal = await Book.count();
    const pagesArray = getTotalPages(bookTotal);
    const offset = (req.params.page - 1) * 10;
    const books = await Book.findAll({limit: 10, offset: offset});
    boolean = isValidPageNumber(pagesArray, parseInt(req.params.page));
    if (boolean === false) {
      throw new InvalidPageError('This page is not valid');
    }
    res.render("index", {headTitle: 'Books', title: 'Library', books: books, pagesArray: pagesArray, pageParam: parseInt(req.params.page)});
  } catch (error) {
      if (error.name === 'InvalidPageError') {
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
    res.redirect('books/page=1');
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

module.exports = router;
