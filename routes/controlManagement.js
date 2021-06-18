var slideConf = require('../models/signage');
var Ftp = require('../models/ftpconfig');
var Signage = require('../models/signage');
var province = require('../models/provinsi');
var area = require('../models/area');
var fs = require('fs'),
    xml2js = require('xml2js');
var lib = require('../library/library');

module.exports = function (app) {


    /* Page Routrer */
    app.get('/controlManagement', function (req, res, next) {
        res.render('control-management', {
            title: 'Control Management',
            layout: 'layouts/dashboard',
            css: ['dashboard/datepicker3', 'dashboard/styles'],
            js: ['dashboard/bootstrap-datepicker', 'dashboard/custom', 'dashboard/control-management']
        });
    });

    /* REST API */


    //Get List Provinces
    app.get('/listProvince', function (req, res, next) {

        lib.fetchData(province, 'all', function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        });

    });

    //Get List Provinces
    app.get('/listArea/:provinceID', function (req, res, next) {

        var provinceID = req.params.provinceID;

        lib.fetchData(area, { province: provinceID }, function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        });

    });

    //Get Specific Provinces
    app.get('/getProvince/:id', function (req, res, next) {

        var id = { _id: req.params.id }

        lib.fetchData(province, id, function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        });

    });

    //Count All Provinces
    app.get('/countProvince', function (req, res, next) {

        lib.countData(province, 'all', function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        });

    });

    //Count All Areas
    app.get('/countArea', function (req, res, next) {

        lib.countData(area, 'all', function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        });

    });

    //Count Area By Province
    app.get('/countArea/:province', function (req, res, next) {

        var province = req.params.province

        lib.countData(area, { province: province }, function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        });

    });

    /* GET FTP configuration. */
    app.get('/listFTPConfig', function (req, res, next) {

        lib.fetchData(Ftp, 'all', function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        });
    });


    app.get('/getArea/:id', function (req, res, next) {

        var id = req.params.id;
        // var file = './data/DigitalForecast-' + province + '.xml';
        // lib.xmlParsing(file, function (result) {
        //     if (result.status == 500) {
        //         res.status(500).send(result.text)
        //     } else {
        //         console.log(result);
        //         var areaLength = result.value.data.forecast[0].area.length;
        //         var areas = [];
        //         var areaArray = []
        //         var areaObj = [];
        //         for (var i = 0; i < areaLength; i++) {
        //             // areas.push(result.data.forecast[0].area[i].$.id);
        //             var id = parseInt(result.value.data.forecast[0].area[i].$.id);
        //             areaObj.push({
        //                 id: id,
        //                 name: result.value.data.forecast[0].area[i].$.description
        //             })
        //         }
        //
        //         res.status(200).json(areaObj);
        //     }
        // });

        lib.fetchData(area, { province: id }, function (result) {
            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {
                res.status(200).json(result.value);
            }
        })

    });

    /* Download XML. */
    app.get('/downloadXML/:name', async function (req, res, next) {

        var province = req.params.name.replace(/\s/g, '');
        await Ftp.find({}, function (err, data) {
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
    });

    /* Sync Province With XML. */
    app.get('/syncArea/:province', function (req, res, next) {

        var provinsi = req.params.province;
        var source = '/ndf/DigitalForecast-' + provinsi.replace(/\s/g, '') + '.xml';
        var dest = './data/DigitalForecast-' + provinsi.replace(/\s/g, '') + '.xml';

        lib.getFTP(source, dest, function (result) {
            if (result.value == true) {

                lib.fetchData(province, { name: provinsi }, function (provinceResult) {
                    if (provinceResult.status == 500) {
                        res.status(500).send(provinceResult.text)
                    } else {

                        lib.xmlParsing(dest, function (result) {
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
                            lib.createCollectiveData(area, areaArray, function (areaResult) {
                                if (result.status == 500) {
                                    res.status(500).json(areaResult.text);
                                } else {
                                    var areaID = [];
                                    for (var i = 0; i < areaResult.value.length; i++) {
                                        areaID.push(areaResult.value[i]._id);
                                    }
                                    lib.updateData(province, { _id: provinceResult.value[0]._id }, { areas: areaID }, function (result) {
                                        res.status(201).json(result);
                                    })

                                }

                            });


                        });


                    }
                });

            } else {
                res.status(500).send(result.text)
            }
        })


    });


    /* POST signage configuration. */
    app.post('/saveArea', function (req, res, next) {

        var areaID = req.body.areaID;
        var areaName = req.body.areaName;
        var domain = req.body.province;

        var d = new Date();


        Ftp.find({}, function (err, data) {
            console.log(data)
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


    });

}
    ;

