var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var ftpconfigSchema = mongoose.Schema({

    ftp_config: {
        ftp_host: String,
        ftp_port: String,
        ftp_username: String,
        ftp_password: String,
        ftp_path: String
    },
    file_config: {
        xml_files: Array,
        area_id: String,
        description: String,
        domain: String,
        sync_time: Number,
        last_sync: String,
        sync_status: Array
    }

});

module.exports = mongoose.model('ftpconfig', ftpconfigSchema);