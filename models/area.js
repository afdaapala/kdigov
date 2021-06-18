var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Signage = require('../models/signage');

var areaSchema = Schema({
    province: { type: Schema.Types.ObjectId, ref: 'Provinsi' },
    areaID: Number,
    region: String,
    level: String,
    name: String,
    lat: String,
    lng: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    signages: [{ type: Schema.Types.ObjectId, ref: 'Signage' }],
    last_update: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Area', areaSchema);
