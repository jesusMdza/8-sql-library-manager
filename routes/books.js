var express = require('express');
var router = express.Router();
var Book = require('../models').Book;

/* wraps each route function callback */
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

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
    const books = await Book.findAll({limit: 8});
    res.render("index", {headTitle: 'Books', title: 'Library', books: books});
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
    res.redirect('/books');
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
  const book = await Book.findByPk(req.params.id);
  try {
    res.render('update-book', {headTitle: book.title, title: 'Update Book', book: book});
  } catch (error) {
    throw error;
  }
}));

/* UPDATE book by id. */
router.post('/:id/update', asyncHandler(async (req, res, next) => {
  console.error(req.body);
  let book = await Book.findByPk(req.params.id);
  console.error(book.title);
  console.error(req.body);
  await book.update(req.body);
  res.redirect('/books');
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
  res.redirect('/books');
}));

module.exports = router;
