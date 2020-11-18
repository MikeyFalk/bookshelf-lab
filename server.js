'use strict';
let bookInfo = [];

const express = require('express');
const app = express();
const superagent = require('superagent');
const dotenv = require('dotenv');
const pg = require('pg');

dotenv.config();

const PORT = process.env.PORT || 3333;
const client = new pg.Client(process.env.DATABASE_URL);




app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', renderHome);
app.get('/searches/new', showForm);
app.post('/searches', createSearch);
app.get('/hello', showHello);
app.get('/error', showError);
app.get('/books/:books_id', getBookDetails);

function getBookDetails(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [req.params.books_id];
  console.log('this is my id', values);

  return client.query(SQL, values)
    .then(result => res.render('pages/books/detail', { book: result.rows[0] }))
    .catch(err => console.error('unable to get book details', err));
}


function showError(req, res) {
  res.send('Sorry, something went wrong: ', err);
}
function showHello(req, res) {
  res.send('Hi how are you?');
}

function renderHome(req, res) {
  let SQL = 'SELECT * FROM books;';


  return client.query(SQL)
    .then(results => res.render('index', { results: results.rows }))
    .catch(err => console.error(err));
}

function showForm(req, res) {
  res.render('pages/searches/new.ejs');
}

function createSearch(req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  console.log(url);

  superagent.get(url)
    .then(data => {
      return data.body.items.map(book => {
        return new Book(book.volumeInfo);
      });
    })
    .then(bookInfo => {
      res.render('pages/searches/show', { bookInfo });
    })
    .catch(err => console.error(err));
}

function Book(info) {
  this.title = info.title || 'no title available';
  this.author = info.author || 'no author available';
  this.image = info.imageLinks.thumbnail || 'https://i.imagur.com/J5LVHEL.jpg';
  this.description = info.description || 'no description available';
  bookInfo.push(this);
  console.log('this is my bookInfo: ', bookInfo);
}

app.use('*', (req, res) => {
  res.status(404).send('Sorry, that does not exist. Try another endpoint.');
})

client.on('error', err => console.err(err));

client.connect()
  .then(() => {
    console.log('connected to DB yay!')
    app.listen(PORT, () => {
      console.log(`server is running:::: ${PORT}`);
    });
  })
  .catch(err => console.log('Unable to connect:', err));
