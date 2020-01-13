var express = require('express');
var router = express.Router();
var Book = require('../models').Book;

function asyncHandler(callback) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (error) {
      console.error('Something happened: ' + error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
    const books = await Book.findAll();
    res.render("index", {title: 'Books', books: books});
}));

/* GET new book form page. */
router.get('/new', asyncHandler(async (req, res, next) => {
  res.render('new-book', {title: 'New Book'});
}));

/* POST new book. */
router.post('/new', asyncHandler(async (req, res, next) => {
  const newBook = await Book.create(req.body);
}));

/* GET book by id. */
router.get('/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  res.render('detail', {title: 'Update book', book: book});
}));

/* UPDATE book by id. */
router.post('/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect('/');
}));

/* DELETE book. */
router.post('/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/');
}));

module.exports = router;
