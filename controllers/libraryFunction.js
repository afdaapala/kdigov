'use strict';

var lib = require('@libraries/library');

/* Upload File */
exports.uploadFile = function(req, res, next) {

    lib.uploadFile(req, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

/* Send Email */
exports.sendEmail = function(req, res, next) {

    lib.uploadFile(req, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}