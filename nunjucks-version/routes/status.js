var express = require("express");
var router = express.Router();

router.post("/webhooks/status", function (req, res) {
  console.log("/status req.body", req.body);
});

module.exports = router;
