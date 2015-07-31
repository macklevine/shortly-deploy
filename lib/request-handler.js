var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  db.Link.findOne({url: uri}).then(function(err, found) {
    if (found) {
      res.send(200, found); //no longer need to use found.attributes
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new db.Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save(function(err, newLink){
          if (err){
            res.send(500, err);
          } else {
            res.send(200, newLink);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({ username: username }).exec(function(err, found){
      if (!found) {
        res.redirect('/login');
      } else {
        found.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, found);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({ username: username }).exec(function(err, found){
    if (!found) {
      var newUser = new db.User({
        username: username,
        password: password
      });
      newUser.save(function(err, newUser){
        if (err){
          res.send(500, err);
        } else {
          util.createSession(req, res, newUser);
        }
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  db.Link.findOne({ code: req.params[0] }).exec(function(err, found){
    if (!found) {
      res.redirect('/');
    } else {
      found.visits++;
      found.save(function(err, found){
        return res.redirect(found.url);
      });
    }
  });
};