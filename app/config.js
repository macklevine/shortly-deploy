var Bookshelf = require('bookshelf');
var path = require('path');

var db = Bookshelf.initialize({
  client: 'sqlite3',
  connection: {
    host: process.env.HOST,
    user: 'your_database_user',
    password: 'password',
    database: 'shortlydb',
    charset: 'utf8',
    filename: path.join(__dirname, '../db/shortly.sqlite')
  }
});

db.knex.schema.hasTable('urls').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('urls', function (link) {
      link.increments('id').primary();
      link.string('url', 255);
      link.string('base_url', 255);
      link.string('code', 100);
      link.string('title', 255);
      link.integer('visits');
      link.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

db.knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('users', function (user) {
      user.increments('id').primary();
      user.string('username', 100).unique();
      user.string('password', 100);
      user.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

module.exports = db;


///////////////////////////////////////
// Mongoose Implementation
///////////////////////////////////////

var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var dbName = 'shortlydb';

mongoose.connect('mongodb://localhost/' + dbName);

var db = mongoose.connection;

var linkSchema = mongoose.Schema({
  url: String,
  base_url: String,
  title: String,
  code: String,
  visits: {type: Number, default: 0}
});

linkSchema.methods.init = function() {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5); 
};

var userSchema = mongoose.Schema({
  username: String,
  password: String
});

userSchema.methods.init = function(){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
}

Jill = new User(...);
Jill.init();
Jill.save();

userSchema.methods.comparePassword = function(){
  
}

var Link = mongoose.model("Link", linkSchema);

var User = mongoose.model("User", userSchema);

// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function (callback) {
//   console.log('Connected to ' + dbName + "!");

//   var linkSchema = mongoose.Schema({
//     code:
//   });
// });


