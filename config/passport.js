var bcrypt = require('bcrypt-nodejs');
var mongojs = require('mongojs');
var db = mongojs.connect('auth_db');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport){

	passport.serializeUser(function(user, done){
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done){
		
		users = db.collection('users');
		users.findOne({ _id: new mongojs.ObjectId(id) }, function(err, user){
			done(err, user);
		});
		
	});


	// Sign-up Logic
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	},
	function(username, password, done){
		
		users = db.collection('users');

		users.findOne({username: username}, function(err, user){

			// Catastrophic error (e.g. database unavailable)
			if(err){ return done(err); }

			// The username is already taken
			if(user){

				// Users need to be approved before allowing access
				if(user.pending === true){
					return done(null, false, { message: 'That username has not been approved yet.' });
				} else {
					return done(null, false, { message: 'That username already exists.' });
				}

			} else {
			// Create a new user, mark as pending approval

				bcrypt.hash(password, null, null, function(err, hash){
					users.save({username:username, hash:hash, pending:true}, function(err, res){
						console.log(res);
						return done(null, res);
					});
				});  
				
			}
		});

	})); // End local-signup Strategy


	// Login Logic
	passport.use('local-login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	},
	function(username, password, done){

		users = db.collection('users');

		users.findOne({username:username}, function(err, user){

			// Catastrophic Error (e.g. no db connection)
			if(err){ return done(err); }

			// Bad username
			if(!user){ return done(null, false, { message: 'No user found by that name.' }); }
			
			// User hasn't been approved
			if (user.pending === true){	return done(null, false, { message: 'That account has not been approved yet' }); } 

			// Validate Password
			bcrypt.compare(password, user.hash, function(err, res){

				if (res == true){ return done(null, user); }
				else { return done(null, false, { message: 'Incorrect password.' }); }

			});
		
		});	
	})); // End local-login Strategy

}