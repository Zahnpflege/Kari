var express = require('express');
const path = require("path");
var router = express.Router();

router.all('/', function(req, res) {
    if(req.query.wettkampf && req.query.bahn){
        res.render(path.join(__dirname, "../public/views/zeitNehmer.html"));
    }
});

module.exports = router;
