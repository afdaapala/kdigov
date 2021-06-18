'use strict';

var Area = require('@models/area');
var Signage = require('@models/signage');
var lib = require('@libraries/library');

/* Page Routrer */
exports.slideManagementPage = function(req, res, next) {

    var token = req.body.token || req.query.token || req.headers['Authorization'];

    res.render('slide-management', {
        title: 'Signage Management',
        layout: 'layouts/dashboard',
        css: ['dashboard/datepicker3', 'dashboard/styles'],
        js: ['dashboard/bootstrap-datepicker', 'dashboard/custom', 'dashboard/slide-management'],
        token: token
    });
}

exports.slideEditorPage = function(req, res, next) {

    var token = req.body.token || req.query.token || req.headers['Authorization'];
    var id = req.query.id

    res.render('slide-editor', {
        title: 'Slide Editor',
        layout: 'layouts/dashboard',
        css: ['dashboard/datepicker3', 'dashboard/styles'],
        js: ['dashboard/bootstrap-datepicker', 'dashboard/custom', 'dashboard/slide-editor'],
        token: token,
        signageID: id
    });
}

/* List User */
exports.listSignage = function(req, res, next) {
    var id = req.query.id;
    var populate = {
        path: 'area',
        model: 'Area',
        populate: {
            path: 'province',
            model: 'provinsi'
        }
    }

    lib.fetchPopulationData(Signage, 'all', populate, function(result) {

        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {

            var displays = [];

            for (var i = 0; i < result.value.length; i++) {
                displays.push(result.value[i])
            }

            res.status(200).json(displays);
        }
    });

}

/* get perairan */
exports.perairan = function(req, res, next) {
    var source = ['Maritim_Cuaca_Wilayah_Perairan.xml'];
    var dest = './public/configFile/';

    lib.getFTP(source, dest, function(result) {

        lib.xmlParsing('./public/configFile/Maritim_Cuaca_Wilayah_Perairan.xml', function(result) {


            console.log(result.value);

            res.status(200).json(result.value);
        })


    })

}

exports.listSignageByArea = function(req, res, next) {

    var id = req.query.id;
    var populate = {
        path: 'signages',
        model: 'Signage'
    }

    lib.fetchPopulationData(Area, { _id: id }, populate, function(result) {

        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {

            res.status(200).json(result.value[0].signages);
        }
    });

}

/* Get User */
exports.getSlide = function(req, res, next) {
    var id = req.body.id || req.query.id || req.params.id

    var populate = {
        path: 'area',
        model: 'Area',
        populate: {
            path: 'province',
            model: 'provinsi'
        }
    }

    lib.fetchPopulationData(Signage, { _id: id }, populate, function(result) {

        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {

            var displays = [];

            for (var i = 0; i < result.value.length; i++) {
                displays.push(result.value[i])
            }

            res.status(200).json(displays);
        }
    });

}

/* Save Slide */
exports.saveSlide = function(req, res, next) {

    var signageID = req.body.signageID
    var title = req.body.title;
    var areaID = req.body.area_id
    var bg = req.body.background_img
    var overlay = req.body.overlay
    var id = uuidv4();

    var data = {
        id: id,
        title: title,
        area_id: areaID,
        background_img: bg + '.jpg',
        overlay: overlay
    };

    var options = { upsert: true, new: true, runValidators: true };
    lib.updateData(Signage, { _id: signageID }, { $push: { slides: data } }, options, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {


            res.status(201).json(result.value);

        }
    })


}

/* Remove Slide */
exports.removeSlide = function(req, res, next) {

    var signageID = req.body.signageID;
    var key = req.body.key;

    lib.fetchData(Signage, { _id: signageID }, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {

            var arr = result.value[0].slides;
            arr.splice(key, 1);

            var options = { overwrite: true, runValidators: true };
            lib.updateData(Signage, { _id: signageID }, { $set: { slides: arr } }, options, function(result) {
                if (result.status == 500) {
                    res.status(500).send(result.text)
                } else {

                    if (result.status == 500) res.status(500).send(result.text)

                    res.status(201).json(result.value);

                }
            })

        }

    })


}

/* Save Signage */
exports.saveSignage = function(req, res, next) {

    var name = req.body.name
    var province = req.body.province;
    var areaID = req.body.area_id
    var status = req.body.display_status
    var perairan = req.body.perairan
    var wilPerairan = req.body.wilayahPerairan

    var data = {
        signage_name: name,
        area: areaID,
        display_status: status,
        logo: ['logo1.jpg'],
        sync_time: '11',
        timer: '15',
        slides: '',
        folder: name.replace(/\s+/g, '-').toLowerCase(),
        running_text: "BMKG (Badan Meteorologi Dan Geofisika)"
    }


    var populate = {
        path: 'province',
        model: 'provinsi'
    }

    lib.fetchPopulationData(Area, { _id: areaID }, populate, function(areaResult) {
        if (areaResult.status == 500) {
            res.status(500).send(areaResult.text)
        } else {

            var slide_1 = {
                title: areaResult.value[0].name,
                area_id: areaResult.value[0].areaID,
                xml: 'DigitalForecast-' + areaResult.value[0].province.name.replace(/\s+/g, '') + '.xml',
                warning_xml: 'WarningsXML-' + areaResult.value[0].province.name.replace(/\s+/g, '_') + '.xml',
                perairanXML: 'Maritim_Cuaca_Wilayah_Perairan.xml',
                wilayahPerairan: perairan,
                background_img: "default.jpg",
                overlay: true,
                updateEvery: '11.00'
            };

            var slide_2 = {
                title: areaResult.value[0].province.name,
                area_id: areaResult.value[0].areaID,
                xml: 'DigitalForecast-' + areaResult.value[0].province.name.replace(/\s+/g, '') + '.xml',
                background_img: "default.jpg",
                overlay: true,
                updateEvery: '11.00'
            };

            if (wilPerairan.length != 0) {

                var slide_3 = {
                    title: 'Wilayah Perairan',
                    area_id: areaID,
                    wilayahPerairan: wilPerairan,
                    xml: 'Maritim_Cuaca_Wilayah_Perairan.xml',
                    background_img: "default.jpg",
                    overlay: true,
                    status: true,
                    updateEvery: '17.00'
                };
            } else {
                var slide_3 = {
                    title: 'Wilayah Perairan',
                    area_id: areaID,
                    wilayahPerairan: [],
                    xml: 'Maritim_Cuaca_Wilayah_Perairan.xml',
                    background_img: "default.jpg",
                    overlay: true,
                    status: false,
                    updateEvery: '17.00'
                };
            }

            var slide_4 = {
                title: 'Informasi Gempa',
                area_id: areaID,
                xml: 'autogempa.xml',
                image: 'eqmap.gif',
                background_img: "default.jpg",
                overlay: true,
                status: true,
                updateEvery: '5 minutes'
            };

            var slide_5 = {
                title: 'Citra Satelit',
                area_id: areaID,
                xml: '',
                image: 'satelit.jpg',
                background_img: "default.jpg",
                overlay: true,
                status: true,
                updateEvery: '10 minutes',
            };
            var slide_6 = {
                title: 'Curah Hujan',
                area_id: areaID,
                xml: '',
                image: 'wrf_hujan.gif',
                background_img: "default.jpg",
                overlay: true,
                status: true,
                updateEvery: '09.00 & 21.00'
            };
            var slide_7 = {
                title: 'Informasi FFC Hari Ini',
                area_id: areaID,
                xml: '',
                image: 'ina_ffmc00.jpg',
                background_img: "default.jpg",
                overlay: true,
                status: true,
                updateEvery: '18.00'
            };
            var slide_8 = {
                title: 'Informasi FFC Esok Hari',
                area_id: areaID,
                xml: '',
                image: 'ina_ffmc01.jpg',
                background_img: "default.jpg",
                overlay: true,
                status: true,
                updateEvery: '18.00'
            };
            var slide_9 = {
                title: 'WW3 SW GIF',
                area_id: areaID,
                xml: '',
                image: 'ww3_sw.gif',
                background_img: "default.jpg",
                overlay: true,
                status: true,
                updateEvery: '17.00'
            };


            var slideArr = [slide_1, slide_2, slide_3, slide_4, slide_5, slide_6, slide_7, slide_8, slide_9];
            data.slides = slideArr;

            lib.createData(Signage, data, function(signageResult) {
                if (signageResult.status == 500) {
                    res.status(500).json(signageResult.text);
                } else {
                    var options = { upsert: true, new: true, runValidators: true };
                    lib.updateData(Area, { _id: areaID }, { $push: { signages: signageResult.value._id } }, options, function(result) {
                        if (result.status == 500) {
                            res.status(500).send(result.text)
                        } else {

                            lib.createFolder('./public/configFile/' + name.replace(/\s+/g, '-').toLowerCase(), '0755', function(result) {

                                var source = './public/images/media/bg.jpg';
                                var dest = './public/configFile/' + name.replace(/\s+/g, '-').toLowerCase() + '/default.jpg';

                                lib.copyFile(source, dest, function(result) {

                                    if (result.status == 500) res.status(500).send(result.text)


                                    var file = [
                                        slide_4.image,
                                        slide_5.image,
                                        slide_6.image,
                                        slide_7.image,
                                        slide_8.image
                                    ]

                                    lib.getFTP(file, './public/configFile/' + name.replace(/\s+/g, '-').toLowerCase() + '/', function(result) {

                                        if (result.status == 500) res.status(500).send(result.text);

                                        var downloadStatus = [];
                                        for (var i = 0; i < result.value.length; i++) {
                                            downloadStatus.push({
                                                file: file[i],
                                                status: result.value[i]
                                            })
                                        }


                                        res.status(200).json(downloadStatus);
                                    })

                                });


                            });


                        }
                    })

                }

            });


        }
    });

}

/* Remove Slide */
exports.removeSignage = function(req, res, next) {

    var signageID = req.body.signageID;
    var areaID = req.body.areaID;
    var signageName = req.body.name;

    lib.deleteData(Signage, { _id: signageID }, function(signageResult) {

        if (signageResult.status == 500) {
            res.status(500).send(result.text)
        } else {
            var options = { overwrite: true, runValidators: true };
            lib.updateData(Area, { _id: areaID }, { $pull: { signages: signageID } }, options, function(result) {
                if (result.status == 500) {
                    res.status(500).send(result.text)
                } else {

                    if (result.status == 500) res.status(500).send(result.text)


                    lib.removeDirectory('./public/configFile/' + signageName.replace(/\s+/g, '-').toLowerCase(), function(result) {

                        res.status(201).json(result.value);
                    });

                }
            })

        }

    })

}

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

/* Update Main Slide */
exports.updateMainSlide = function(req, res, next) {

    var signageID = req.body._id
    var logo2 = req.body.logo_2;
    var runningText = req.body.running_text;

    var options = { overwrite: true, runValidators: true };
    lib.fetchData(Signage, { _id: signageID }, function(result) {

        var status = '';
        result.value[0].logo[0] = 'logo1.png';
        if (logo2 != '') {
            result.value[0].logo[1] = logo2 + '.png';
        } else {
            result.value[0].logo[1] = '';
        }
        result.value[0].running_text = runningText;

        var options = { overwrite: true, runValidators: true };
        lib.updateData(Signage, { _id: signageID }, { $set: { logo: result.value[0].logo, running_text: result.value[0].running_text } }, options, function(result) {


            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {

                if (result.status == 500) res.status(500).send(result.text)


                res.status(201).json(result.value);

            }
        })

    })

}

exports.updateSignageStatus = function(req, res, next) {

    var signageID = req.body._id;
    var currentTime = new Date();

    var options = { overwrite: true, runValidators: true };
    lib.updateData(Signage, { _id: signageID }, { $set: { display_status: true, sync_time: currentTime } }, options, function(result) {

        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {

            if (result.status == 500) res.status(500).send(result.text)

            res.status(201).json(result.value);
        }
    })

}

/* Get User */
exports.updateSlide = function(req, res, next) {

    var signageID = req.body.signageID
    var slideID = req.body.id
    var title = req.body.title
    var bgImage = req.body.background_img;
    var areaID = req.body.area_id;
    var overlay = req.body.overlay;
    var perairan = req.body.perairan;

    var options = { overwrite: true, runValidators: true };
    lib.fetchData(Signage, { _id: signageID }, function(result) {

        var status = '';

        result.value[0].slides[slideID].title = title;
        result.value[0].slides[slideID].overlay = overlay;
        result.value[0].slides[slideID].background_img = bgImage;
        if (slideID == 0 && perairan != null) {
            result.value[0].slides[slideID].wilayahPerairan = perairan;
        }

        var options = { overwrite: true, runValidators: true };
        lib.updateData(Signage, { _id: signageID }, { $set: { slides: result.value[0].slides } }, options, function(result) {

            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {

                if (result.status == 500) res.status(500).send(result.text)

                res.status(201).json(result.value);

            }
        })

    })

}

exports.updateSlideStatus = function(req, res, next) {

    var signageID = req.query.signageID
    var slideID = req.query.slideID
    var options = { overwrite: true, runValidators: true };
    lib.fetchData(Signage, { _id: signageID }, function(result) {

        var status = '';

        if (result.value[0].slides[slideID].status == false) {
            status = true;
        } else {
            status = false;
        }
        result.value[0].slides[slideID].status = status;
        var data = result.value[0].slides[slideID]

        var options = { overwrite: true, runValidators: true };
        lib.updateData(Signage, { _id: signageID }, { $set: { slides: result.value[0].slides } }, options, function(result) {


            if (result.status == 500) {
                res.status(500).send(result.text)
            } else {

                if (result.status == 500) res.status(500).send(result.text)


                res.status(201).json(result.value);

            }
        })

    })

}


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}