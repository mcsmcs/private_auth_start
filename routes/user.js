var mongojs = require('mongojs');
var users = mongojs.connect('auth_db').collection('users');
var bcrypt = require('bcrypt-nodejs');


/*
 *	Get a list of all users
 */
exports.list = function(req, res){
	  
	users.find(function(err, docs){
		res.render('users', { users: docs });	
	});
}


/*
 *	Update a single user
 */
exports.update = function(req, res){

	users.findOne({username:req.body.username}, function(err, user){

		if(err){ req.flash('error', err); res.redirect('/'); }
		if(!user){ req.flash('error', 'User not found'); res.redirect('/users')}
		
		if(req.body.active === 'on'){
			users.update({username:req.body.username},{$set: {pending:false}});
		} else {
			users.update({username:req.body.username},{$set: {pending:true}});
		}

		if(req.body.password !== ''){
			
			bcrypt.hash(req.body.password, null, null, function(err, hash){
				users.update({username:req.body.username}, {$set: {hash:hash}});
			});
		}

		res.redirect('/users');

	});
	
}


/*
 *	Update multiple users in a single form
 */
exports.updateUsers = function(req, res){

	for (username in req.body){

		users.findOne({username:username}, function(err, user){

			if(err){ req.flash('error', err); }
			if(!user){ req.flash('error', 'User not found'); }
			
			if(req.body[user.username].active === 'on'){
				users.update({username:user.username},{$set: {pending:false}}, function(err, res){
					console.log(res + "  " + username);
				});
			} else {
				users.update({username:user.username},{$set: {pending:true}});
			}

			if(req.body[user.username].password !== ''){
				
				bcrypt.hash(req.body[user.username].password, null, null, function(err, hash){
					users.update({username:user.username}, {$set: {hash:hash}});
				});
			}

		});

	}

	res.redirect('/users');
}