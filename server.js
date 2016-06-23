'use strict';
const express = require('express');
const mongoose = require('mongoose');

const app = express();

const dbUrl = 'mongodb://localhost:27017/short_url';

const port = process.env.PORT || 3000;

mongoose.connect(dbUrl, function(err, db){
	if(err){
		console.log('Failed to connect to MongoDB');
	}else{
		console.log('Successfully connected to MongoDB');
	}
});

let URL = mongoose.model('URL', {original_url : String, short_url : Number});


app.get('/', function(req, res){
	res.send('Welcome to the shortened url app. Enter a url as a parameter!');
});


app.get('*', function(req, res){
	let url = req.url;
	var cleanUrl = url.slice(1);
	let validUrl = isUrlValid(cleanUrl);
	if(!validUrl){
		// is the url in the database for short?
		URL.find({short_url: cleanUrl}, function(err, url){
			console.log(url);
			if(!err && url.length == 1){
				if(url[0].original_url.charAt(0) == 'h'){
					res.redirect(url[0].original_url);
				}else{
					res.redirect('http://' + url[0].original_url);
				}
			}else{
				res.json({message : cleanUrl + ' is not a valid URL.'});
			}
		});

	}else{
		URL.find({original_url : cleanUrl}, function(err, url){
			console.log(url);
			if(err){
				throw err;
			}else if(!url.length){
				let urlNumber = getRandomUrlNumber();
				URL.create({original_url : cleanUrl, 
						short_url : urlNumber}, 
				function(err, data){
					if(err){
						throw err;
					}else{
						console.log(data);
						res.json({original_url : cleanUrl,
							short_url : urlNumber});
					}
				});
			}else if(url.length == 1){
				res.json({original_url : url[0].original_url,
					short_url : url[0].short_url});
			}
		});
	}

});


app.listen(port);


function isUrlValid(url){
	let pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/; // fragment locater
	  if(!pattern.test(url)) {
	    return false;
	  } else {
	    return true;
	  }
}


function getRandomUrlNumber(){
	return Math.floor(Math.random() * (1000 - 1) + 1);
}

