let express = require("express");
let router = express.Router();

router.get("/", async function (req, res, next) {
  let data = {
    title: "Nunjucks example",
    layout: "layout.njk",
    message: "Hello world!",
  };

  res.render("index.njk", data);
});

module.exports = router;
