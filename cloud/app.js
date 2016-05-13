// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var parseExpressCookieSession = require('parse-express-cookie-session');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var app = express();
//var blizAPI = require('cloud/battlenet-api/lib/battlenet-api.js');
//var Mandrill = require('mandrill');
//Mandrill.initialize('t0aUB64xNENaWHqGbOWh6g');


// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(parseExpressHttpsRedirect());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('SECRET_SIGNING_KEY'));
app.use(parseExpressCookieSession({
  fetchUser: true,
  key: 'image.sess',
  cookie: {
    maxAge: 3600000 * 24 * 30
  }
}));
app.get('/test', function(req, res){
  var test = {};
  var request = Parse.Promise();
  Parse.Cloud.httpRequest({
    method: "GET",
    url: "https://us.api.battle.net/wow/character/Azgalor/Sickorsane?locale=en_US&apikey=qa9qe4tqvjtjgtjjrx9y7zv3mn4hwcx3",
    success: function(httpResponse){

      test = JSON.parse(httpResponse.text);

      res.render('test', {test: test});
    },
    error: function(httpRespons){
      res.render('test', {test: "POOP"});
    }
  });
});

app.get('/', function(req, res) {

  if( Parse.User.current()) {
     var user = Parse.User.current();
  }
  else{
     var user = undefined;
  }
  res.render('index', {user: user});
});

app.get('/register', function(req, res){
  res.render('register', {message: undefined, error1: undefined, error2: undefined});
});

app.get('/userProfile', function(req, res){
  if(Parse.User.current()){
    var user = Parse.User.current();
  }
  else{
    res.render('error', {message: 'You must be logged in to view this page'});
  }

  res.render('userProfile', {user: user});

});

app.post('/logout', function(req, res){
  Parse.User.logOut();
  res.redirect('/');
});

app.post('/', function(req, res) {
  var user = undefined;
  var username = req.body.username;

  Parse.User.logIn(username, req.body.password).then(function(user) {
      res.render('userProfile', {user: Parse.User.current()});
  },
  function(error) {
    var userName = Parse.Object.extend("User");
    var userQuery = new Parse.Query(userName);

/*
    userQuery.equalTo("username", username);
    userQuery.find({
      success: function(results){
        if (results.length < 1){
          res.render('login', {message: undefined, error1: "Invalid username"});
        }
        else{
          res.render('login', {message: undefined, error1: "Incorrect Password"})
        }
      }
    });
    */
    res.render('userProfile', {user: Parse.User.current()});
  });
});

app.post('/register', function(req, res){
  var username = req.body.inputUsername;
  var password = req.body.inputPassword;
  var passwordRetype = req.body.inputPassword2;
  var email = req.body.inputEmail;
  var atpos = email.indexOf('@');
  var dotpos = email.lastIndexOf('.');
  var fName = req.body.firstName;
  var lName = req.body.lastName;

  if(email  == null || email == '') {
    e = 'Email must be filled out!';
    res.render('register', {message: undefined, error1: e});
    return;
  } else if (atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length) {
    e = 'Not a valid e-mail address!';
    res.render('register', {message: undefined, error1: e});
    return;
  } else if(password == null || password == '')	{
    e = 'Password must be filled out!';
    res.render('register', {message: undefined, error1: e});
    return;
  } else if(passwordRetype == null || passwordRetype == '' || passwordRetype !== password)	{
    e = 'Passwords must match!';
    res.render('register', {message: undefined, error1: e});
    return;
  }
  if(password != "" && password == passwordRetype) {
    if(password.length < 8) {
      e = 'Password must be longer than 8 characters!';
      res.render('register', {message: undefined, error1: e});
      return;
    }
    if(password == email) {
      e = 'Password must be different from username!';
      res.render('register', {message: undefined, error1: e});
      return;
    }
    re = /[0-9]/;
    if(!re.test(password)) {
      e = 'password must contain at least one number!';
      res.render('register', {message: undefined, error1: e});
      return;
    }
    re = /[a-z]/;
    if(!re.test(password)) {
      e = 'password must contain at least one lowercase letter!';
      res.render('register', {message: undefined, error1: e});
      return;
    }
    re = /[A-Z]/;
    if(!re.test(password)) {
      e = 'password must contain at least one capital letter!';
      res.render('register', {message: undefined, error1: e});
      return;;
    }
  }

  // Simple syntax to create a new subclass of Parse.Object.
  var user = new Parse.User();
  user.set("username", username);
  user.set("password", password);
  user.set("email", email);
  user.set("firstName", fName);
  user.set("lastName", lName);
  user.signUp(null, {
    success: function(user) {
      // Hooray! Let them use the app now.
      res.render('userProfile', { user: user });
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      res.render('register', { message: 'Error: ' + error.message });
    }
  });
});

app.listen();
