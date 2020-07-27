const fetch = require('node-fetch');
var express = require('express');
var router = express.Router();

var passport = require('passport');

router.get('/encryption/', function(req, res, next) {
  res.render('index', { user : req.user });
});

router.get('/encryption/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/encryption/login', passport.authenticate('local', 
    {successRedirect: '/encryption/',
    failureRedirect: '/encryption/login',
    session: true}));

router.get('/encryption/logout', function(req, res) {
    req.logout();
    res.redirect('/encryption/');
});

async function ImageFluxAPIInternal(apiName, body) {
	const method = "POST";
	const headers = {
		'Content-Type': 'application/json',
		'X-Sora-Target': apiName,
		'Authorization': 'Bearer ' + process.env.IMAGEFLUX_ACCESS_TOKEN
	};
	console.log(body);
	const apires = await fetch(process.env.IMAGEFLUX_ENDPOINT, {method, headers, body})
	return await apires.text();
}

router.get('/encryption/key', async function(req, res) {
	// res.set('Access-Control-Allow-Origin', '*');
    if(req.user && req.query.kid){
        const param = {"kid": req.query.kid};
        const apiName = "ImageFlux_20200707.GetEncryptKey";
        const text = await ImageFluxAPIInternal(apiName,JSON.stringify(param));
        const encrypt_key = JSON.parse(text).encrypt_key;
        res.status(200).send(new Buffer(encrypt_key, "hex"));
    }else{
        res.status(404).send('');
    }
});
 
module.exports = router;