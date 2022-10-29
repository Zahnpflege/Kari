var express = require('express');
const path = require("path");


var router = express.Router();

router.all('/', function(req, res) {
    res.render(path.join(__dirname, "../public/views/zeitNehmer.html"));
});

router.all('/in', function(req, res) {
    res.render(path.join(__dirname, "../public/views/admin_input.html"));
});

router.all('/out', function(req, res) {
    res.render(path.join(__dirname, "../public/views/zeitNehmer.html"));
});

module.exports = router;
