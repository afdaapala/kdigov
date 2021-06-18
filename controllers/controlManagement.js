'use strict';

var slideConf = require('@models/signage');
var Ftp = require('@models/ftpconfig');
var Signage = require('@models/signage');
var province = require('@models/provinsi');
var area = require('@models/area');
var fs = require('fs'),
    xml2js = require('xml2js');
var lib = require('@libraries/library');

/* Page Routrer */
exports.controlManagementPage = function (req, res, next) {

    var token = req.body.token || req.query.token || req.headers['Authorization'];

    res.render('control-management', {
        title: 'Control Management',
        layout: 'layouts/dashboard',
        css: ['dashboard/datepicker3', 'dashboard/styles'],
        js: ['dashboard/bootstrap-datepicker', 'dashboard/custom', 'dashboard/control-management'],
        token: token
    });
}

/* Province */
exports.listProvince = function (req, res, next) {

    lib.fetchData(province, 'all', function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}


exports.getProvince = function (req, res, next) {

    var id = { _id: req.params.id }

    lib.fetchData(province, id, function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

exports.getSpecificAreaByName = function (req, res, next) {

    var name = { name: req.params.name }

    lib.fetchData(area, name, function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

exports.countProvince = function (req, res, next) {

    lib.countData(province, 'all', function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

/* Area */

exports.countArea = function (req, res, next) {

    lib.countData(area, 'all', function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

exports.countAreaByProvince = function (req, res, next) {

    var id = req.params.id

    lib.countData(area, { province: id }, function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}


exports.listAreaByProvince = function (req, res, next) {

    var provinceID = req.params.id;

    lib.fetchData(area, { province: provinceID }, function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

exports.getArea = function (req, res, next) {

    var id = req.params.id;

    lib.fetchData(area, { _id: id }, function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    })

}

exports.saveArea = function (req, res, next) {

    var areaID = req.body.areaID;
    var areaName = req.body.areaName;
    var domain = req.body.province;

    var d = new Date();

    Ftp.find({}, function (err, data) {
        var ftp = {
            file_config: {
                area_id: areaID,
                description: areaName,
                domain: domain,
                xml_files: ['DigitalForecast-' + domain],
                sync_time: 1,
                last_sync: d,
                sync_status: []
            }
        }

        Ftp.update({ _id: data[0]._id }, ftp, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.send('Sukses')
            }
        })

    });

}

/* FTP Configuration. */
exports.listFTPConfig = function (req, res, next) {

    lib.fetchData(Ftp, 'all', function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

/* FTP Configuration. */
exports.lsFTP = function (req, res, next) {

    lib.listFTP(function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            var image = [];
            for (var i = 0; i < result.value.length; i++) {
                var file = result.value[i].filename;

                if (file.split('.').pop() == 'png' || file.split('.').pop() == 'gif' || file.split('.').pop() == 'jpg' || file.split('.').pop() == 'jpeg') {
                    image.push(file);
                }
            }

            res.status(200).json(image);
        }
    })

}

exports.downloadXML = async function (req, res, next) {

    var province = req.params.name.replace(/\s/g, '');
    await Ftp.find({}, async function (err, data) {
        if (data.length != 0) {
            if (err) {
                console.log(err);
            }

            const ftp = require('basic-ftp');

            var config = {
                host: data[0].ftp_config.ftp_host,
                user: data[0].ftp_config.ftp_username,
                password: data[0].ftp_config.ftp_password,
                port: data[0].ftp_config.ftp_port
            };

            const client = await new ftp.Client();
            client.ftp.verbose = true;

            try {
                await client.access(config);

                await ftp.downloadToDir('./data/DigitalForecast-' + province + '.xml', data[0].ftp_config.ftp_path + 'ndf/DigitalForecast-' + province + '.xml').then(function (list) {
                    res.json(list);
                });
            } catch (err) {
                console.error(err);
            }

            await client.close();
        }
    });

}

exports.syncArea = function (req, res, next) {

    var provinsi = req.params.name;
    var source = ['ndf/DigitalForecast-' + provinsi.replace(/\s/g, '') + '.xml'];
    var dest = './data/';

    lib.getFTP(source, dest, function (result) {
        if (result.value[0] == true) {

            var populate = {
                path: 'areas',
                model: 'Area'
            }
            lib.fetchPopulationData(province, { name: provinsi }, populate, function (provinceResult) {

                if (provinceResult.status == 500) {
                    res.status(500).send(provinceResult.text)
                } else {
                    lib.xmlParsing(dest + 'ndf/DigitalForecast-' + provinsi.replace(/\s/g, '') + '.xml', function (result) {
                        var areaLength = result.value.data.forecast[0].area.length;
                        var resultStatus = [];
                        var areaObj = {};
                        var areaArray = [];
                        for (var i = 0; i < areaLength; i++) {
                            var id = parseInt(result.value.data.forecast[0].area[i].$.id);

                            areaObj = {
                                province: provinceResult.value[0]._id,
                                areaID: result.value.data.forecast[0].area[i].$.id,
                                region: result.value.data.forecast[0].area[i].$.region,
                                level: result.value.data.forecast[0].area[i].$.level,
                                name: result.value.data.forecast[0].area[i].$.description,
                                lat: result.value.data.forecast[0].area[i].$.latitude,
                                lng: result.value.data.forecast[0].area[i].$.longitude
                            }
                            areaArray.push(areaObj);


                        }

                        if (provinceResult.value[0].areas.length != 0) {

                            lib.deleteData(area, { _id: { $in: provinceResult.value[0].areas } }, function (deleteResult) {

                                if (deleteResult.status == 500) {
                                    res.status(500).send(deleteResult.text)
                                } else {

                                    lib.createCollectiveData(area, areaArray, function (areaResult) {
                                        if (areaResult.status == 500) {
                                            res.status(500).json(areaResult.text);
                                        } else {
                                            var areaID = [];
                                            var options = { upsert: true, new: true, runValidators: true };
                                            for (var i = 0; i < areaResult.value.length; i++) {
                                                areaID.push(areaResult.value[i]._id);
                                            }
                                            lib.updateData(province, { _id: provinceResult.value[0]._id }, { $set: { areas: areaID } }, options, function (result) {

                                                console.log(result);

                                                res.status(201).json(result);
                                            })

                                        }

                                    });
                                }
                            });

                        } else {
                            lib.createCollectiveData(area, areaArray, function (areaResult) {
                                if (areaResult.status == 500) {
                                    res.status(500).json(areaResult.text);
                                } else {
                                    var areaID = [];
                                    var options = { upsert: true, new: true, runValidators: true };
                                    for (var i = 0; i < areaResult.value.length; i++) {
                                        areaID.push(areaResult.value[i]._id);
                                    }
                                    lib.updateData(province, { _id: provinceResult.value[0]._id }, { $set: { areas: areaID } }, options, function (result) {
                                        res.status(201).json(result);
                                    })

                                }

                            });

                        }


                    });


                }
            });

        } else {
            res.status(500).send(result.text)
        }
    })

}