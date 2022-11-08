const { Pool } = require('pg');

const pool = new Pool({
  user: 'jake', // IF YOU FORKED THIS REPO THIS MUST BE CHANGED
  host: 'localhost',
  database: 'ratingsandreviews',
  port: 5432,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0
});

module.exports = {
  getReviews: function(req, res) {
    pool.query(`select * from (
      select a.id as review_id, a.rating, a.summary, a.recommend, a.response,
      a.body, a.date, a.reviewer_name, a.helpfulness, (select json_agg(ph) from
      (select id, url from reviews_photos where review_id = a.id )ph ) as photos
      from reviews as a where product_id = $1 limit $2 offset(cast($3 as integer) *  cast($2 as integer) - $2) ) r;`,
      [req.query.product_id, req.query.count, req.query.page])
    .then(result => {

      result.rows.forEach(review => {
        review.date = new Date(Number(review.date)).toISOString();
        if(review.response === 'null') {
          review.response = null;
        }
      });

      res.json({
        "product": req.query.product_id,
        "page": req.query.page,
        "count": req.query.count,
        "results": result.rows
      });
      });
  },

  getReviewMeta: function(req, res) {
    const getMetaQuery = `
      SELECT json_build_object
        (
          'product_id', ${req.query.product_id},
          'ratings',
              (SELECT jsonb_object_agg(rating, count) from
                (SELECT
                rating, COUNT(rating)
                FROM reviews
                WHERE product_id = ${req.query.product_id}
                GROUP BY rating)
              as t),
          'recommended',
              (SELECT json_object_agg(recommend, count) from
                (SELECT
                recommend, count(recommend) as count
                FROM reviews
                where product_id = ${req.query.product_id}
                GROUP BY recommend)
              as t),
          'characteristics',
              (SELECT json_object_agg(name, json_build_object('id', the_id, 'value', the_value)) from
                (SELECT
                c.name, AVG(cr.value) as the_value, c.id as the_id
                FROM characteristics c left join characteristic_reviews cr on c.id = cr.characteristic_id
                WHERE c.product_id = ${req.query.product_id}
                GROUP BY c.id)
              as t)
        )
    `;
    pool.query(getMetaQuery)
    .then(results => {
      let metaData = results.rows[0].json_build_object;

      metaData.ratings = Object.assign({1: 0, 2: 0, 3: 0, 4:0, 5:0}, metaData.ratings);
      res.json(metaData);
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
    pool.query(`INSERT INTO reviews(product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
              VALUES (${req.body.product_id}, ${req.body.rating}, '${new Date().getTime()}', '${req.body.summary}', '${req.body.body}', ${req.body.recommend}, ${false}, '${req.body.name}', '${req.body.email}', ${null}, ${0})
              RETURNING id`
              ).then(data => {
                let queries = [];
                //console.log(data.rows[0].id);

                Object.keys(req.body.characteristics).forEach(key => {
                  queries.push(pool.query(`INSERT INTO characteristic_reviews
                                           (characteristic_id, review_id, value)
                                           VALUES
                                           (${Number(key)}, ${data.rows[0].id}, ${req.body.characteristics[key]})`
                                           ));
                });

                req.body.photos.forEach(photo => {
                  queries.push(pool.query(`INSERT INTO reviews_photos
                                           (review_id, url)
                                           VALUES
                                           (${data.rows[0].id}, '${photo}')`
                                           ));
                });

                Promise.all(queries).then(() => {
                  res.sendStatus(201);
                });
              });
  },
};