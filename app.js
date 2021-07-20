var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let nunjucks = require("nunjucks");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

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
app.use("/users", usersRouter);

// express generator defines port at `/bin/www`
console.log(`app listening at http://localhost:3000`);

module.exports = app;
