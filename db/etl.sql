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

-- These selects fix the auto incrementing of ID
SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id)+1 FROM reviews), 1), false);
SELECT setval('reviews_photos_id_seq', COALESCE((SELECT MAX(id)+1 FROM reviews_photos), 1), false);
SELECT setval('characteristic_id_seq', COALESCE((SELECT MAX(id)+1 FROM characteristics), 1), false);
SELECT setval('characteristic_reviews_id_seq', COALESCE((SELECT MAX(id)+1 FROM characteristic_reviews), 1), false);

-- These should be the same in console, they are a test to see if the 4 lines above did what they should
SELECT MAX(id) FROM reviews;
SELECT MAX(id) FROM reviews_photos;
SELECT MAX(id) FROM characteristics;
SELECT MAX(id) FROM characteristic_reviews;
SELECT nextval('reviews_id_seq');
SELECT nextval('reviews_photos_id_seq');
SELECT nextval('characteristics_id_seq');
SELECT nextval('characteristic_reviews_id_seq');

CREATE INDEX reviews_product_id_index on reviews (product_id);
CREATE INDEX review_photos_review_id_index on reviews_photos (review_id);
CREATE INDEX characteristic_reviews_characteristic_id_index on characteristic_reviews (characteristic_id);
CREATE INDEX characteristics_product_id_index on characteristics (product_id);
CREATE INDEX characteristics_id_index on characteristics (id);


