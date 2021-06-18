var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var provinsiSchema = Schema({
    name: String,
    areas: [{ type: Schema.Types.ObjectId, ref: 'Area' }]
});

module.exports = mongoose.model('provinsi', provinsiSchema);