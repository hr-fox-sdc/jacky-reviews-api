var express = require('express');

const { getReviews, getReviewMeta, markHelpful, markReported, postReview} = require('./helpers.js');

var app = express();
app.use(express.json());

const logger = (request, response, next) => {
  console.info(`Received ${request.method} request to endpoint ${request.url}.`);
  next();
};

app.use(logger);

app.get('/reviews', (req, res) => {
  getReviews(req, res);
});

app.get('/reviews/meta', (req, res) => {
  getReviewMeta(req, res);
});

app.put('/reviews/:id/helpful', (req, res) => {
  markHelpful(req, res);
});

app.put('/reviews/:id/report', (req, res) => {
  markReported(req, res);
});

app.post('/reviews', (req, res) => {
  postReview(req, res);
});

let port = 4000;
app.listen(port);
console.log(`Listening on ${port}`);