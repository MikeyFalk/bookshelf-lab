'use strict';
let bookInfo = [];

const express = require('express');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3333;

app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', renderHome);
app.get('/searches/new', showForm);
app.post('/searches', createSearch);
app.get('/hello', showHello);

function showHello(req, res) {
  res.send('Hi how are you?');
}

function renderHome(req, res) {
  res.render('pages/index.ejs');
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



app.listen(PORT, () => {
  console.log(`server is running:::: ${PORT}`);
});
