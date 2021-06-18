var fs = require('fs'),
    xml2js = require('xml2js');
var Ftp = require('../models/ftpconfig');


module.exports = {
    fetchData: function (model, data, cb) {

        var lookedData = '';

        if (data == 'all') {
            lookedData = {};
        } else {
            lookedData = data
        }

        model.find(lookedData, function (err, results) {
            if (results.length > 0) {

                if (err) cb({ status: 500, text: 'Failed to fetch data', value: err })

                cb({ status: 200, text: 'Success to fetch data', value: results });

            } else {
                cb({ status: 200, text: 'No Result Found', value: {} })
            }

        });
    },
    createData: function (model, data, cb) {

        var record = new model(data);

        record.save(function (err, result) {
            if (err) {
                cb({ status: 500, text: 'Failed to create data', value: err })
            } else {
                cb({ status: 201, text: 'Success to create data', value: result });
            }
        })
    },
    createCollectiveData: function (model, dataArray, cb) {

        model.insertMany(dataArray)
            .then(function (docs) {
                cb({ status: 201, text: 'Success to create data', value: docs });
            })
            .catch(function (err) {
                cb({ status: 500, text: 'Failed to create data', value: err })
            });
    },
    createDataPopulation: function (model1, model2, data1, data2, cb) {

        var record1 = new model1(data1);

        record1.save(function (err) {
            if (err) {
                cb({ status: 500, text: 'Failed to create data', value: err })
            } else {

                var record2 = new model2(data2);

                record2.save(function (err, result) {
                    if (err) cb({ status: 500, text: 'Failed to create data', value: err })

                    cb({ status: 201, text: 'Success to create data', value: result });

                });
            }
        })
    },
    updateData: function (model, data, updateValue, cb) {

        var lookedData = '';

        if (data == 'all') {
            lookedData = {};
        } else {
            lookedData = data
        }

        model.find(lookedData, function (err, data) {

            if (err) cb({ status: 500, text: 'Failed to fetch data', value: err })
            model.update({ _id: data[0]._id }, updateValue, function (err, result) {
                if (err) {
                    cb({ status: 500, text: 'Failed to update data', value: err })
                } else {
                    cb({ status: 201, text: 'Success to update data', value: result });
                }
            })

        });
    },
    deleteData: function (model, id, cb) {

        var lookedData = '';

        model.findByIdAndRemove(id, function (err, result) {

            if (err) cb({ status: 500, text: 'Failed to remove data', value: err })

            cb({ status: 202, text: 'Success to remove data', value: result });
        });
    },
    countData: function (model, data, cb) {

        var lookedData = '';

        if (data == 'all') {
            lookedData = {};
        } else {
            lookedData = data
        }

        model.count(lookedData, function (err, result) {
            if (err) cb({ status: 500, text: 'Failed to count data', value: err })

            cb({ status: 200, text: 'Success to count data', value: result });
        })
    },
    uploadFile: function (file, path, cb) {
        fs.readFile(req.files.displayImage.path, function (err, data) {
            var newPath = __dirname + path + file;
            fs.writeFile(newPath, data, function (err) {
                if (err) cb('Upload Error');

                cb("Done");
            });
        });
    },
    xmlParsing: function (file, cb) {
        var parser = new xml2js.Parser();

        fs.readFile(file, function (err, data) {

            if (data !== undefined) {

                if (err) cb({ status: 500, text: 'Failed to read file', value: err })

                parser.parseString(data, function (err, result) {

                    if (err) cb({ status: 500, text: 'Error parsing XML', value: err })

                    cb({ status: 200, text: 'Success to parsing XML', value: result });

                });
            } else {
                if (err) cb({ status: 500, text: 'Undefined data', value: err })
            }
        });
    },
    // getFTP: function (file, destination, cb) {

    //     Ftp.find({}, function (err, data) {
    //         if (data.length != 0) {
    //             if (err) {
    //                 cb({status: 500, text: 'Failed to read ftp conf', value: err})
    //             }

    //             var SFTPClient = require('sftp-promises');
    //             const util = require('util')

    //             var config = {
    //                 host: data[0].ftp_config.ftp_host,
    //                 username: data[0].ftp_config.ftp_username,
    //                 password: data[0].ftp_config.ftp_password,
    //                 port: data[0].ftp_config.ftp_port
    //             };
    //             var sftp = new SFTPClient(config);
    //             var session = sftp.session(config).then(function (ftpSession) {
    //                 session = ftpSession
    //             })


    //             sftp.get(data[0].ftp_config.ftp_path + file, destination).then(function (list) {
    //                 if (list == true) {
    //                     cb({status: 200, text: 'Success download from FTP Source', value: list});
    //                 } else {
    //                     cb({status: 500, text: 'Failed download from FTP Source', value: list})
    //                 }

    //             })

    //         } else {
    //             cb({status: 500, text: 'No FTP Conf Found', value: {}})
    //         }

    //     });
    // }
};