const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// Serve static files from the "public" directory
app.use(express.static(__dirname));

app.use(function (req, res, next) {
  next();
});

app.get("/images", function (req, res) {
  let imagesList = [];

  fs.readdirSync(path.join(__dirname)).forEach((file) => {
    imagesList.push(file);
  });

  res.send(imagesList);
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
