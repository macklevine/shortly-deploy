var db = require('../config');  //initializes bookshelf database; sets up tables (links, users)
var crypto = require('crypto'); //for hashing strings securely

var Link = db.Model.extend({ 
  tableName: 'urls', //associates the model with a table that holds instances of it
  hasTimestamps: true, 
  defaults: { //sets default values
    visits: 0 
  },
  initialize: function(){ //when created...
    this.on('creating', function(model, attrs, options){
      var shasum = crypto.createHash('sha1'); //creates a sha1 hashing object with a hashing function.
      shasum.update(model.get('url'));  //shasum runs a method called update which hashes the url string from the Link model
      model.set('code', shasum.digest('hex').slice(0, 5)); // sets the code attribute on the Link model to be the first 6 characters of the shasum hash
    });
  }
});

module.exports = Link;

///////////////////////////////////////
// Mongoose Implementation
///////////////////////////////////////

var db = require('../config');
var crypto = require('crypto');