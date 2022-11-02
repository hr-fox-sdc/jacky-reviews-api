var express = require('express');

// Set what we are listening on.
var app = express();
app.use(express.json());

//TODO: ROUTES



let port = 4000;
app.listen(port);
console.log(`Listening on ${port}`);