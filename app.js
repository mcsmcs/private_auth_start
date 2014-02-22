/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var login = require('./routes/login');
var isAuthenticated = login.isAuthenticated;
var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var app = express();

var db = mongojs.connect('auth_db');
require('./config/passport')(passport);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'hello githubbers' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


/***************************
*	Root route
*/
app.get('/', login.login);


/***************************
*	Login routing
*/

// Remove these two after setting up an initial admin
// app.get('/login/setup', login.adminsetup);
// app.post('/login/setup', passport.authenticate('local-adminsetup', {
// 	successRedirect: '/',
// 	failureRedirect: '/login/setup',
// 	failureFlash: true
// }));

app.get('/login/signup', login.signup);
app.post('/login/signup', passport.authenticate('local-signup', {
    successRedirect: '/login/pending',
    failureRedirect: '/login/signup',
    failureFlash: true
}));

app.get('/login', login.login);
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/users',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/login/pending', login.pending);
app.get('/login/success', login.success);
app.get('/login/logout', login.logout);


/***************************
*	User management routing
*/
app.get('/users', isAuthenticated, user.list);
app.post('/user/updateUsers', isAuthenticated, user.updateUsers);
app.get('/user/delete/:username', isAuthenticated, user.delete);
//app.post('/user/:username', isAuthenticated, user.update);



http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});