-- To create these tables:
-- cd into db directory of this repo
-- createdb nameOfDB
-- psql nameOfDB
-- \i schema.sql
-- \i etl.sql

DROP TABLE IF EXISTS characteristic_reviews;
DROP TABLE IF EXISTS reviews_photos;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS characteristics;

CREATE TABLE IF NOT EXISTS reviews (
  "id" INT NOT NULL,
  "product_id" INT NOT NULL,
  "rating" INT NOT NULL,
  "date" VARCHAR(30) NOT NULL,
  "summary" VARCHAR(250),
  "body" VARCHAR(1000) NOT NULL,
  "recommend" BOOLEAN NOT NULL,
  "reported" BOOLEAN NOT NULL,
  "reviewer_name" VARCHAR(60) NOT NULL,
  "reviewer_email" VARCHAR(60) NOT NULL,
  "response" VARCHAR(250),
  "helpfulness" INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS reviews_photos (
  "id" INT NOT NULL,
  "review_id" INT NOT NULL references reviews(id),
  "url" VARCHAR(200),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS characteristics (
  "id" INT NOT NULL,
  "product_id" INT NOT NULL,
  "name" VARCHAR(60),
  PRIMARY KEY  (id)
);

CREATE TABLE IF NOT EXISTS characteristic_reviews (
  "id" INT NOT NULL,
  "characteristic_id" INT NOT NULL references characteristics(id),
  "review_id" INT NOT NULL references reviews(id),
  "value" INT NOT NULL,
  PRIMARY KEY(id)
)

