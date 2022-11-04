const { Pool } = require('pg');

const pool = new Pool({
  user: 'jake',
  host: 'localhost',
  database: 'ratingsandreviews',
  port: 5432,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0
});

module.exports = {
  getReviews: function(req, res) {
    let sort = '';
    if(req.query.sort === 'newest') {
      sort = 'date DESC';
    } else if(req.query.sort === 'helpful') {
      sort = 'helpfulness DESC';
    } else {
      sort = 'date DESC, helpfulness DESC';
    }

    query = {
      text: `
      SELECT id as review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
      from reviews
      where product_id = ${req.query.product_id}
      order by ${sort}
      limit ${req.query.count || 5}
      offset ${((req.query.page * req.query.count) - req.query.count) || 1}`
    }
    pool.query(query).then((data) => {
      let photoQueries = [];
      data.rows.forEach(review => {
        review.photos = [];
        review.date = new Date(Number(review.date)).toISOString();
        if(review.response === 'null') {
          review.response = null;
        }
        let photoQuery = pool.query(`SELECT id, url
                                     from reviews_photos
                                     where review_id = ${review.review_id}`
                                     ).then(data => {
                                      data.rows.forEach((photo) => {
                                        review.photos.push(photo);
                                      })
                                     });
        photoQueries.push(photoQuery);
      });
      Promise.all(photoQueries).then(() => {
        //console.log(data.rows);
        res.json({
          "product": req.query.product_id,
          "page": req.query.page,
          "count": req.query.count,
          "results": data.rows
        });
      });
    });
  },
  getReviewMeta: function(req, res) {
    let queries = [];
  queries.push(pool.query(`SELECT * from reviews WHERE product_id = ${req.query.product_id}`));
  queries.push(pool.query(`SELECT id, name from characteristics WHERE product_id = ${req.query.product_id}`));

  Promise.all(queries).then((data) => {
    let characteristicRatingQueries = [];
    data[0].rows.forEach(review => {
      characteristicRatingQueries.push(pool.query(`SELECT characteristic_id, value from characteristic_reviews where review_id = ${review.id}`));
    });
    Promise.all(characteristicRatingQueries).then(reviewsCharacteristicRatings => {

      let totalOfRatings = {};

      reviewsCharacteristicRatings.forEach(reviewCharacteristicRatings => {
        reviewCharacteristicRatings.rows.forEach(individualRating => {
          if(totalOfRatings[individualRating.characteristic_id]) {
            totalOfRatings[individualRating.characteristic_id] += individualRating.value;
          } else {
            totalOfRatings[individualRating.characteristic_id] = individualRating.value;
          }
        });
      });

      let characteristics = {};
      data[1].rows.forEach(characteristic => {
        characteristics[characteristic.name] = {
          'id': characteristic.id,
          'value': (totalOfRatings[characteristic.id] / data[0].rows.length)
        };
      });

      res.json({
        "product_id": req.query.product_id,
        "ratings": {
          1: data[0].rows.filter(row => {
            return row.rating === 1;
          }).length,
          2: data[0].rows.filter(row => {
            return row.rating === 2;
          }).length,
          3: data[0].rows.filter(row => {
            return row.rating === 3;
          }).length,
          4: data[0].rows.filter(row => {
            return row.rating === 4;
          }).length,
          5: data[0].rows.filter(row => {
            return row.rating === 5;
          }).length
        },
        "recommended": {
          "false": data[0].rows.filter(row => {
            return !row.recommend;
          }).length,
          "true": data[0].rows.filter(row => {
            return row.recommend;
          }).length
        },
        "characteristics": characteristics
      });
    });
  });
  },
  markHelpful: function(req, res) {
    pool.query(`UPDATE reviews SET helpfulness = helpfulness+1 WHERE id = ${req.params.id}`)
      .then(() => res.status(200).end());
  },
  markReported: function(req, res) {
    pool.query(`UPDATE reviews SET reported = true WHERE id = ${req.params.id}`)
      .then(() => res.status(200).end());
  },
  postReview: function(req, res) {

  },
};