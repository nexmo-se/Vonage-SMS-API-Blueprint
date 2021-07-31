var express = require("express");
var router = express.Router();

router.post("/webhooks/inbound", function (req, res) {
  console.log("/inbound req.body", req.body);
});

module.exports = router;
