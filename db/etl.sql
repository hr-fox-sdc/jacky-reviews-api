COPY reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
FROM '/Users/jake/repos/hack-reactor/jacky-reviews-api/data/reviews.csv'
DELIMITER ','
CSV HEADER;

COPY reviews_photos(id, review_id, url)
FROM '/Users/jake/repos/hack-reactor/jacky-reviews-api/data/reviews_photos.csv'
DELIMITER ','
CSV HEADER;

COPY characteristics(id, product_id, name)
FROM '/Users/jake/repos/hack-reactor/jacky-reviews-api/data/characteristics.csv'
DELIMITER ','
CSV HEADER;

COPY characteristic_reviews(id, characteristic_id, review_id, value)
FROM '/Users/jake/repos/hack-reactor/jacky-reviews-api/data/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;

