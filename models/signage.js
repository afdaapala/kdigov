var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var signageSchema = mongoose.Schema({
    signage_name: String,
    area: {type: Schema.Types.ObjectId, ref: 'Area'},
    display_status: Boolean,
    logo: [],
    timer: Number,
    sync_time: Number,
    running_text: String,
    slides: [],
    last_sync: String,
    last_sync_status: Boolean,
    folder: String
});

module.exports = mongoose.model('Signage', signageSchema);