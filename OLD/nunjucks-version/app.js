var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let nunjucks = require("nunjucks");

var crypto = require("crypto");
var https = require("https");
var localtunnel = require("localtunnel");
var { v4: uuidv4 } = require("uuid");
var config = require("./config.js");
var { access } = require("fs");

var indexRouter = require("./routes/index");
var inbound = require("./routes/inbound");
var status = require("./routes/status");

var app = express();

// configute Nunjucks with 'views' as templates directory
nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/webhooks/inbound", inbound);
app.use("/webhooks/status", status);

// express generator defines port at `/bin/www`
console.log(`app listening at http://localhost:3000`);

module.exports = app;
