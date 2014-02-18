

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