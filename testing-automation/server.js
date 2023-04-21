const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
const path = require("path");
const fs = require("fs");

app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 5000000
  })
);
// Allow CORS requests from any domain
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(bodyParser.json({ limit: "500mb" }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname)));

app.use(function (req, res, next) {
  next();
});

app.get("/images", function (req, res) {
  let imagesList = [];

  fs.readdirSync(path.join(__dirname, "/images")).forEach((file) => {
    imagesList.push(file);
  });

  res.send(imagesList);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
