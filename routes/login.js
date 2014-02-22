var mongojs = require('mongojs');
var users = mongojs.connect('auth_db').collection('users');
var bcrypt = require('bcrypt-nodejs');


/***************************************************
*	Login and Signup Routes
*/
exports.signup = function(req, res){
	res.render('login/signup', {flash: req.flash('error')});
};

exports.login = function(req, res){
	res.render('login/login', {flash: req.flash('error')});
}

exports.pending = function(req, res){
	res.render('login/pending');
}

exports.success = function(req, res){
	res.render('login/success');
}

exports.logout = function(req, res){
	req.logout();
	res.redirect('/');
}

exports.adminsetup = function(req, res){
	res.render('login/adminsetup', {flash: req.flash('error'), adminsetup: true});
}

exports.isAuthenticated = function(req, res, next){
	if (req.isAuthenticated())
		return next();
	else
		res.redirect('/');
}



/***************************************************
*	User routes
*/
exports.userList = function(req, res){
	  
	users.find().sort({username:1}, function(err, docs){
		res.render('login/users', { currentUser: req.user, users: docs });	
	});
}


exports.updateUser = function(req, res){

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


exports.updateUsers = function(req, res){

	for (username in req.body){

		users.findOne({username:username}, function(err, user){

			if(err){ req.flash('error', err); }
			if(!user){ req.flash('error', 'User not found'); }
			
			if(req.body[user.username].active === 'on' || req.user.username === req.body[user.username]) {
				users.update({username:user.username},{$set: {pending:false}});
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


exports.deleteUser = function(req, res){

	users.remove({username:req.params.username}, function(err){
		if (err){ req.flash('error', err); res.redirect('/users'); }

		res.redirect('/users');
	});
}