INSTALLATION

Setup:

make sure all these csv's: https://drive.google.com/drive/folders/1Gqxt7Tw0I50OG2dn4LncHAJ_x_BnWuRX
are in a 'data' directory within this repo

brew update
brew doctor
brew install k6
brew install postgresql
brew services start postgresql

npm install

change host in server/helpers.js:4

cd db/
createdb ratingsandreviews
psql ratingsandreviews
\i schema.sql
\i etl.sql

to run: npm start
to test: npm test
