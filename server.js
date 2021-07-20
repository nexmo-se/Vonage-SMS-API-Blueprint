var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var crypto = require("crypto");
var https = require("https");
var localtunnel = require("localtunnel");
var { v4: uuidv4 } = require("uuid");
var config = require("./config.js");
var { access } = require("fs");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send(200);
});

app.post("/webhooks/inbound", (req, res) => {
  console.log(req.body);
  res.status(200).end();
});

app.post("/webhooks/status", (req, res) => {
  // console.log(req.body);
  res.status(200).end();
});

app.listen(3000, () => {
  console.log(`🌏 http://localhost:3000`);
});
