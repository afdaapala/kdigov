var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var activeSignageSchema = mongoose.Schema({
    signage: []
});

module.exports = mongoose.model('ActiveSignage', activeSignageSchema);