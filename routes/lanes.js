var express = require('express');
const path = require("path");
var router = express.Router();
const session = require('express-session');



router.all('/', function(req, res) {
    console.log('[INFO] get /lane data: '+ req.query)
    if(!req.session.logged_in || req.session.rolle !== 'kari'){
        res.send('Please Log In!')
        return
    }
    if(req.query.wettkampf){
        res.render(path.join(__dirname, "../public/views/zeitNehmer.html"));
    }else{
        res.send('Wettkampf nicht angegeben')
    }
});

module.exports = router;
