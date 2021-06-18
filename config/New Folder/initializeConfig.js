var Ftp = require('../models/ftpconfig');
var Provinsi = require('../models/provinsi');
var User = require('../models/user');
var defaultConf = require('../config/config');
var schedule = require('node-schedule');
var fs = require('fs');

module.exports = {
    initializeUser: function () {
        User.find({}, function (err, datas) {

            if (!datas.length) {

                var data = new User({
                    name: 'Admin',
                    email: 'admin@bmkg.go.id',
                    password: 'diseminasi',
                    role: 'administrator',
                    area: null
                })

                data.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Admin Saved');
                    }
                })


            }

        });
    },
    initializeProvince: function () {
        Provinsi.find({}, function (err, datas) {

            if (!datas.length) {

                for (var i = 0; i < defaultConf.province.length; i++) {
                    var province = new Provinsi({
                        name: defaultConf.province[i],
                    })

                    province.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Province Saved');
                        }
                    })
                }


            }

        });
    },
    initializeFTP: function (cb) {
        Ftp.find({}, function (err, datas) {

            if (!datas.length) {
                var ftp = new Ftp({
                    ftp_config: {
                        ftp_host: defaultConf.ftp_config.ftp_host,
                        ftp_port: defaultConf.ftp_config.ftp_port,
                        ftp_username: defaultConf.ftp_config.ftp_username,
                        ftp_password: defaultConf.ftp_config.ftp_password,
                        ftp_path: defaultConf.ftp_config.ftp_path,
                        sync_time: defaultConf.ftp_config.sync_time
                    },
                    file_config: {
                        xml_files: [],
                        area_id: '',
                        description: '',
                        domain: '',
                        sync_time: 22,
                        last_sync: '',
                        sync_status: []
                    }
                })

                ftp.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('FTP Config Saved');
                        cb(1)
                    }
                })
            } else {
                cb(0)
            }

        });
    },
    syncFTP: async function () {
        await Ftp.find({}, async function (err, data) {
            if (data.length != 0) {
                if (err) {
                    console.log(err);
                }
                var rule = new schedule.RecurrenceRule();
                rule.minute = data[0].file_config.sync_time;

                var j = schedule.scheduleJob(rule, async function () {
                    const ftp = require('basic-ftp');

                    var config = {
                        host: data[0].ftp_config.ftp_host,
                        user: data[0].ftp_config.ftp_username,
                        password: data[0].ftp_config.ftp_password,
                        port: data[0].ftp_config.ftp_port
                    };

                    const client = await new ftp.Client();
                    client.ftp.verbose = truel;

                    try {
                        ftp.list(data[0].ftp_config.ftp_path + '/autogempa.xml', './data/autogempa.xml').then(function (list) {
                            console.log(list)
                        });

                        // ftp.list(data[0].ftp_config.ftp_path + '/DigitalForecast-' + domain + '.xml', './data/autogempa.xml').then(function (list) {
                        //     console.log(list)
                        // });
                    } catch (err) {
                        console.error(err);
                    }

                    await client.close();

                });
            }


        });
    },
    uploadFile: function (file, path, cb) {
        fs.readFile(req.files.displayImage.path, function (err, data) {
            var newPath = __dirname + path + file;
            fs.writeFile(newPath, data, function (err) {
                if (err) cb('Upload Error');

                cb("Done");
            });
        });
    }
};