'use strict';

const fs = require('fs');
const xml2js = require('xml2js');
const Signage = require('@models/signage');
const ActiveSignage = require('@models/activeSignage');
const FTP = require('@models/ftpconfig');
const legend = require('@configs/config');
const lib = require('@libraries/library');
const rest = require('restler');

// load config files
let confFile = require('@configs/config.json');
let conf = confFile.parameter_config;

/* Page Routrer */
exports.signagePage = async function (req, res, next) {
    await res.render('index', {
        title: 'Signage',
        layout: 'layouts/signage',
        css: ['style'],
        js: ['script']
    });
}

exports.registerSignagePage = async function (req, res, next) {
    await res.render('dashboard-home', {
        title: 'Registration',
        layout: 'layouts/registerSignage',
        css: ['dashboard/styles'],
        js: ['dashboard/custom', 'dashboard/registrationSignage'],
        bmkg_server: conf.bmkg_server,
        bmkg_client: conf.bmkg_client
    });
}


exports.signageConfig = async function (req, res, next) {
    await lib.fetchData(ActiveSignage, {}, function (result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).send(result)
        }
    });
}

exports.checkConnection = function (req, res, next) {
    require('dns').resolve('www.google.co.id', function (err) {
        if (err) {
            res.status(200).send("No Internet")
        } else {
            res.status(200).send("Ada Internet")
        }
    });
}

exports.updateSignageValue = async function (req, res, next) {
    let id = req.params.id

    await rest.get(conf.bmkg_server + '/api/signage/listSignageByID/' + id).on('complete', async function (result) {
        if (result instanceof Error) {
            console.log('Error Update Value:', result.message);
            this.retry(5000)
        } else {
            await ActiveSignage.remove({}, async function (err, signageResult) {
                if (signageResult.status == 500) {
                    res.status(500).send('Error Removing Documents')
                } else {
                    await lib.createData(ActiveSignage, {
                        signage: result
                    }, function (signageResult, cb) {
                        if (signageResult.status == 500) {
                            res.status(500).send(result.text)
                        } else {
                            res.status(200).send('Done')
                        }
                    })
                }
            })
        }
    })
}

exports.activateSignage = async function (req, res, next) {
    let data = req.body.signage;

    require('dns').resolve('www.google.co.id', async function (err) {
        if (err) {
            res.status(500).send("No Internet")
        } else {
            await ActiveSignage.remove({}, async function (err, result) {
                if (result.status == 500) {
                    console.error(result);
                    res.status(500).send('Error Removing Documents')
                } else {
                    await lib.createData(ActiveSignage, { signage: data }, async function (signageResult) {
                        if (signageResult.status == 500) {
                            console.error(signageResult);
                            res.status(500).send(signageResult.text)
                        } else {
                            let destination = './public/tmp';
                            let url = conf.bmkg_data;
                            let url2 = conf.bmkg_server + '/configFile/';

                            let file1 = {
                                url: url + signageResult.value.signage[0].slides[0].xml,
                                filename: signageResult.value.signage[0].slides[0].xml,
                                destination: destination
                            };
                            let file2 = {
                                url: url + signageResult.value.signage[0].slides[0].warning_xml,
                                filename: signageResult.value.signage[0].slides[0].warning_xml,
                                destination: destination
                            };
                            let file = [file1, file2]

                            // console.log(file);
                            for (let i = 0; i < signageResult.value.signage[0].slides.length; i++) {
                                if (i == 0) {
                                    file.push({
                                        url: url2 + signageResult.value.signage[0].folder + '/' + signageResult.value.signage[0].slides[i].background_img,
                                        filename: signageResult.value.signage[0].slides[i].background_img,
                                        destination: destination
                                    })
                                } else if (i > 0 && signageResult.value.signage[0].slides[i].background_img != signageResult.value.signage[0].slides[i - 1].background_img) {
                                    file.push({
                                        url: url2 + signageResult.value.signage[0].folder + '/' + signageResult.value.signage[0].slides[i].background_img,
                                        filename: signageResult.value.signage[0].slides[i].background_img,
                                        destination: destination
                                    })
                                }
                            }

                            if (signageResult.value.signage[0].logo.length > 1) {
                                file.push({
                                    url: url2 + signageResult.value.signage[0].folder + '/' + signageResult.value.signage[0].logo[1],
                                    filename: signageResult.value.signage[0].logo[1],
                                    destination: destination
                                })
                            }

                            // console.log(file);
                            await lib.downloadFile(file, async function (downloadResult) {
                                let fileArr = [];
                                let dest = './public/tmp/';
                                for (let i = 0; i < signageResult.value.signage[0].slides.length; i++) {
                                    console.log(signageResult.value.signage[0].slides[i]);
                                    if (i == 2) {
                                        fileArr.push(signageResult.value.signage[0].slides[i].xml)
                                    } else if (i == 3) {
                                        fileArr.push(signageResult.value.signage[0].slides[i].xml)
                                        fileArr.push(signageResult.value.signage[0].slides[i].image)
                                    } else if (i > 1) {
                                        fileArr.push(signageResult.value.signage[0].slides[i].image)
                                    }
                                }

                                let downloadStatus = [];
                                for (let i = 0; i < downloadResult.value.length; i++) {
                                    downloadStatus.push({
                                        file: file[i].filename,
                                        status: downloadResult.value[i]
                                    })

                                }

                                // console.log(fileArr);
                                await lib.getFTP(fileArr, dest, async function (result) {
                                    if (result.status == 500) {
                                        console.log(result);
                                        res.status(500).send(result.text)
                                    } else {
                                        let ftpStatus = [];
                                        for (let i = 0; i < result.value.length; i++) {
                                            downloadStatus.push({
                                                file: fileArr[i],
                                                status: result.value[i]
                                            })
                                        }
                                        res.status(200).send(downloadStatus)
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    });
}

exports.getMainPerairan = async function (req, res, next) {

    let parser = new xml2js.Parser();

    await ActiveSignage.find({}, async function (err, datas) {
        let filename = datas[0].signage[0].slides[0].perairanXML;
        if (err) {
            await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                if (result instanceof Error) {
                    console.log('Error Get Main PErairan:', result.message);
                    this.retry(5000); // try again after 5 sec 
                } else {
                    console.log(result);
                }
            });
        }

        if (datas.length != 0) {
            await fs.readFile('./public/activeSignage/' + filename, async function (err, data) {
                if (err || data === null || data === undefined) {
                    await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                        if (result instanceof Error) {
                            console.log('Error:', result.message);
                            this.retry(5000); // try again after 5 sec 
                        } else {
                            console.log(result);
                        }
                    });
                } else {
                    await parser.parseString(data, async function (err, result) {
                        console.log(result)
                        if (err || result === null || result === undefined) {
                            rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                                if (result instanceof Error) {
                                    console.log('Error:', result.message);
                                    this.retry(5000); // try again after 5 sec 
                                } else {
                                    console.log(result);
                                }
                            });
                            res.status(500).send("Error Parsing XML");
                        } else {
                            let data = [];
                            for (let i = 0; i < result.Wilayah_Perairan.Data[0].Row.length; i++) {
                                data.push(result.Wilayah_Perairan.Data[0].Row[i].Wilayah[0]);
                            }
                            let results = []

                            let index = data.indexOf(datas[0].signage[0].slides[0].wilayahPerairan);
                            results.push(result.Wilayah_Perairan.Data[0].Row[index])
                            res.json(results);
                        }
                    });
                }
            });
        } else {
            res.json('No Data');
        }
    });
}


exports.getSlide1 = async function (req, res, next) {

    let time = req.params.hour;
    let parser = new xml2js.Parser();
    let tomorrow = '';
    let lusa = ''
    let daytime = '';
    let hour = '';
    switch (true) {
        case (time >= 1 && time < 7):
            hour = 1;
            tomorrow = 5;
            lusa = 9;
            daytime = 0;
            break;
        case (time >= 7 && time < 13):
            hour = 1;
            tomorrow = 6;
            lusa = 10;
            daytime = 0;
            break;
        case (time >= 13 && time < 19):
            hour = 2;
            tomorrow = 7;
            lusa = 11;
            daytime = 0;
            break;
        case (time >= 19 || time == 0):
            hour = 3;
            tomorrow = 8;
            lusa = 11;
            daytime = 1;
            break;
        default:
            hour = 0;
            tomorrow = 5;
            lusa = 9;
            daytime = 1;
            break;
    }


    await ActiveSignage.find({}, async function (err, datas) {
        let filename = datas[0].signage[0].slides[0].xml;
        if (err) res.status(500).send("Error Retrieve Data");
        if (datas.length != 0) {
            await fs.readFile('./public/activeSignage/' + filename, async function (err, data) {
                if (err) {
                    await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                        if (result instanceof Error) {
                            console.log('Error:', result.message);
                            this.retry(5000); // try again after 5 sec 
                        } else {
                            console.log(result);
                        }
                    });
                } else {
                    await parser.parseString(data, async function (err, result) {
                        if (err || result === null || result === undefined) {
                            await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                                if (result instanceof Error) {
                                    console.log('Error:', result.message);
                                    this.retry(5000); // try again after 5 sec 
                                } else {
                                    console.log(result);
                                }
                            });
                            res.status(500).send("Error Parsing XML");
                        } else {
                            let id = datas[0].signage[0].slides[0].area_id.toString();
                            let areaLength = result.data.forecast[0].area.length;
                            let areas = [];
                            for (let i = 0; i < areaLength; i++) {
                                areas.push(result.data.forecast[0].area[i].$.id);
                            }
                            let areaID = areas.indexOf(id);
                            let areaValue = result.data.forecast[0].area[areaID].parameter;
                            let weatherIconToday = areaValue[6].timerange[hour].value[0]._;
                            let weatherValueToday = legend.icon[weatherIconToday];
                            let wdf = [areaValue[7].timerange[0].value[0]._, areaValue[7].timerange[1].value[0]._, areaValue[7].timerange[2].value[0]._, areaValue[7].timerange[3].value[0]._, areaValue[7].timerange[4].value[0]._, areaValue[7].timerange[tomorrow].value[0]._, areaValue[7].timerange[lusa].value[0]._];
                            let wdfResult = [];
                            let wpf = [areaValue[6].timerange[0].value[0]._, areaValue[6].timerange[1].value[0]._, areaValue[6].timerange[2].value[0]._, areaValue[6].timerange[3].value[0]._, areaValue[6].timerange[4].value[0]._, areaValue[6].timerange[tomorrow].value[0]._, areaValue[6].timerange[lusa].value[0]._];
                            let wpfResult = [];

                            for (let i = 0; i < wpf.length; i++) {
                                let wpfcon = legend.icon[wpf[i]]
                                if (i < 2 || i > 4) {
                                    wpfResult.push(wpfcon[0]);
                                } else {
                                    wpfResult.push(wpfcon[1]);
                                }
                            }

                            for (let i = 0; i < wdf.length; i++) {
                                if (wdf[i] >= 0 && wdf[i] <= 22.5) {
                                    wdfResult.push('Utara')
                                } else if (wdf[i] >= 22.5 && wdf[i] <= 67.5) {
                                    wdfResult.push('Timur Laut')
                                } else if (wdf[i] >= 67.5 && wdf[i] <= 112.5) {
                                    wdfResult.push('Timur')
                                } else if (wdf[i] >= 112.5 && wdf[i] <= 157.5) {
                                    wdfResult.push('Tenggara')
                                } else if (wdf[i] >= 157.5 && wdf[i] <= 202.5) {
                                    wdfResult.push('Selatan')
                                } else if (wdf[i] >= 202.5 && wdf[i] <= 247.5) {
                                    wdfResult.push('Barat Daya')
                                } else if (wdf[i] >= 247.5 && wdf[i] <= 292.5) {
                                    wdfResult.push('Barat')
                                } else if (wdf[i] >= 292.5 && wdf[i] <= 337.5) {
                                    wdfResult.push('Barat Laut')
                                }
                            }

                            let weatherValue = {
                                time: areaValue[2].timerange[0].$.day,
                                area: result.data.forecast[0].area[areaID].$,
                                currentTemp: areaValue[5].timerange[hour].value[0]._,
                                currentWeather: weatherValueToday[daytime],
                                currentWeatherText: weatherValueToday[2],
                                tempMaxToday: areaValue[2].timerange[0].value[0]._,
                                tempMinToday: areaValue[4].timerange[0].value[0]._,
                                tempMaxTomorrow: areaValue[2].timerange[1].value[0]._,
                                tempMinTomorrow: areaValue[4].timerange[1].value[0]._,
                                humidMaxToday: areaValue[1].timerange[0].value[0]._,
                                humidMinToday: areaValue[3].timerange[0].value[0]._,
                                humidMaxTomorrow: areaValue[1].timerange[1].value[0]._,
                                humidMinTomorrow: areaValue[3].timerange[1].value[0]._,
                                wff1: areaValue[5].timerange[0].value[0]._,
                                wff2: areaValue[5].timerange[1].value[0]._,
                                wff3: areaValue[5].timerange[2].value[0]._,
                                wff4: areaValue[5].timerange[3].value[0]._,
                                wff5: areaValue[5].timerange[tomorrow].value[0]._,
                                wff6: areaValue[5].timerange[lusa].value[0]._,
                                wfp1: wpfResult[0],
                                wfp2: wpfResult[1],
                                wfp3: wpfResult[2],
                                wfp4: wpfResult[3],
                                wfp5: wpfResult[4],
                                wfp6: wpfResult[5],
                                hff1: areaValue[0].timerange[0].value[0]._,
                                hff2: areaValue[0].timerange[1].value[0]._,
                                hff3: areaValue[0].timerange[2].value[0]._,
                                hff4: areaValue[0].timerange[3].value[0]._,
                                hff5: areaValue[0].timerange[tomorrow].value[0]._,
                                hff6: areaValue[0].timerange[lusa].value[0]._,
                                wdf1: wdfResult[0],
                                wdf2: wdfResult[1],
                                wdf3: wdfResult[2],
                                wdf4: wdfResult[3],
                                wdf5: wdfResult[4],
                                wdf6: wdfResult[5],
                                wsf1: areaValue[8].timerange[0].value[0]._,
                                wsf2: areaValue[8].timerange[1].value[0]._,
                                wsf3: areaValue[8].timerange[2].value[0]._,
                                wsf4: areaValue[8].timerange[3].value[0]._,
                                wsf5: areaValue[8].timerange[tomorrow].value[0]._,
                                wsf6: areaValue[8].timerange[lusa].value[0]._
                            }

                            res.json(weatherValue);
                        }
                    });
                }
            });
        } else {
            res.json('No Data');
        }
    });
}

/* Page Routrer */
exports.getSlide2 = async function (req, res, next) {

    let time = req.params.hour;
    let hour = '';
    let tomorrow = '';
    let daytime = '';
    switch (true) {
        case (time >= 1 && time < 7):
            hour = 0;
            tomorrow = 5;
            daytime = 1;
            break;
        case (time >= 7 && time < 13):
            hour = 1;
            tomorrow = 6;
            daytime = 1;
            break;
        case (time >= 13 && time < 19):
            hour = 2;
            tomorrow = 7;
            daytime = 1;
            break;
        case (time >= 19 || time == 0):
            hour = 3;
            tomorrow = 8;
            daytime = 1;
            break;
        default:
            hour = 0;
            tomorrow = 5;
            daytime = 1;
            break;
    }

    await ActiveSignage.find({}, async function (err, datas) {

        let filename = datas[0].signage[0].slides[0].xml;
        let parser = new xml2js.Parser();
        await fs.readFile('./public/activeSignage/' + filename, async function (err, data) {
            if (err) {
                await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                    if (result instanceof Error) {
                        console.log('Error:', result.message);
                        this.retry(5000); // try again after 5 sec 
                    } else {
                        console.log(result);
                        res.status(200).send('Gagal Update Slide')
                    }
                });
            } else {
                await parser.parseString(data, async function (err, result) {
                    if (err || result === null || result === undefined) {
                        await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                            if (result instanceof Error) {
                                console.log('Error:', result.message);
                                this.retry(5000); // try again after 5 sec 
                            } else {
                                console.log(result);
                            }
                        });
                    } else {
                        let areaLength = result.data.forecast[0].area.length;
                        let areaName = [];
                        let areaParameter = [];
                        let areaObject = []
                        for (let i = 0; i < areaLength; i++) {
                            if (result.data.forecast[0].area[i].name[0]._ !== undefined && result.data.forecast[0].area[i].name[0]._.split(' ')[0] != 'Pelabuhan') {
                                let areaValue = result.data.forecast[0].area[i].parameter;
                                let weatherIconToday = areaValue[6].timerange[hour].value[0]._;
                                let weatherValueToday = legend.icon[weatherIconToday];
                                let weatherIconTomorrow = areaValue[6].timerange[tomorrow].value[0]._;
                                let weatherValueTomorrow = legend.icon[weatherIconTomorrow];
                                let wdf = areaValue[7].timerange[hour].value[0]._;
                                let wdfResult = [];

                                if (wdf >= 0 && wdf <= 22.5) {
                                    wdfResult.push('Utara')
                                } else if (wdf >= 22.5 && wdf <= 67.5) {
                                    wdfResult.push('Timur Laut')
                                } else if (wdf >= 67.5 && wdf <= 112.5) {
                                    wdfResult.push('Timur')
                                } else if (wdf >= 112.5 && wdf <= 157.5) {
                                    wdfResult.push('Tenggara')
                                } else if (wdf >= 157.5 && wdf <= 202.5) {
                                    wdfResult.push('Selatan')
                                } else if (wdf >= 202.5 && wdf <= 247.5) {
                                    wdfResult.push('Barat Daya')
                                } else if (wdf >= 247.5 && wdf <= 292.5) {
                                    wdfResult.push('Barat')
                                } else if (wdf >= 292.5 && wdf <= 337.5) {
                                    wdfResult.push('Barat Laut')
                                }
                                areaObject.push({
                                    time: areaValue[2].timerange[0].$.day,
                                    province: datas[0].signage[0].slides[1].title,
                                    areaName: result.data.forecast[0].area[i].name[0]._,
                                    tempMaxToday: areaValue[2].timerange[0].value[0]._,
                                    tempMinToday: areaValue[4].timerange[0].value[0]._,
                                    tempMaxTomorrow: areaValue[2].timerange[1].value[0]._,
                                    tempMinTomorrow: areaValue[4].timerange[1].value[0]._,
                                    humidMaxToday: areaValue[1].timerange[0].value[0]._,
                                    humidMinToday: areaValue[3].timerange[0].value[0]._,
                                    humidMaxTomorrow: areaValue[1].timerange[1].value[0]._,
                                    humidMinTomorrow: areaValue[3].timerange[1].value[0]._,
                                    windDir: wdfResult[0],
                                    windSpeed: areaValue[8].timerange[hour].value[0]._,
                                    weatherToday: weatherValueToday[daytime],
                                    weatherTomorrow: weatherValueTomorrow[daytime]
                                })
                            }
                        }
                        res.json(areaObject);
                    }
                });
            }
        });
    });


}

/* Page Routrer */
exports.getSlide3 = async function (req, res, next) {

    await ActiveSignage.find({}, async function (err, datas) {
        let filename = datas[0].signage[0].slides[2].xml;
        let parser = new xml2js.Parser();
        await fs.readFile('./public/activeSignage/' + filename, async function (err, data) {

            if (err) {
                await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                    if (result instanceof Error) {
                        console.log('Error:', result.message);
                        this.retry(5000); // try again after 5 sec 
                    } else {
                        console.log(result);
                    }
                });
            } else {
                await parser.parseString(data, async function (err, result) {
                    if (err || result == null || result == undefined) {
                        await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                            if (result instanceof Error) {
                                console.log('Error:', result.message);
                                this.retry(5000); // try again after 5 sec 
                            } else {
                                console.log(result);
                            }
                        });
                    } else {
                        let data = [];
                        for (let i = 0; i < result.Wilayah_Perairan.Data[0].Row.length; i++) {
                            data.push(result.Wilayah_Perairan.Data[0].Row[i].Wilayah[0]);
                        }
                        let results = []
                        for (let i = 0; i < datas[0].signage[0].slides[2].wilayahPerairan.length; i++) {
                            let index = data.indexOf(datas[0].signage[0].slides[2].wilayahPerairan[i]);
                            results.push(result.Wilayah_Perairan.Data[0].Row[index])
                        }
                        res.json({ publicationDate: result.Wilayah_Perairan.PublicationDate[0], value: results });
                    }
                });
            }
        });
    });
}

/* Page Routrer */
exports.getSlide4 = async function (req, res, next) {
    await ActiveSignage.find({}, async function (err, datas) {
        let filename = datas[0].signage[0].slides[3].xml;
        let parser = new xml2js.Parser();
        await fs.readFile('./public/activeSignage/' + filename, async function (err, data) {
            if (err || data == null || data == undefined) {
                await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                    if (result instanceof Error) {
                        console.log('Error:', result.message);
                        this.retry(5000); // try again after 5 sec 
                    } else {
                        console.log(result);
                    }
                });
            } else {
                await parser.parseString(data, async function (err, result) {
                    if (err || result === null || result === undefined) {
                        await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                            if (result instanceof Error) {
                                console.log('Error get slide 4:', result.message);
                                this.retry(5000); // try again after 5 sec 
                            } else {
                                console.log(result);
                            }
                        });
                        res.status(500).send("Error Parsing XML");
                    } else {
                        let gempa = [];
                        gempa.push(result.Infogempa.gempa[0]);
                        res.json(gempa);
                    }
                });
            }
        });
    });
}

/* Page Routrer */
exports.getWarning = async function (req, res, next) {
    await ActiveSignage.find({}, async function (err, datas) {
        let filename = datas[0].signage[0].slides[0].warning_xml;
        let parser = new xml2js.Parser();
        await fs.readFile('./public/activeSignage/' + filename, async function (err, data) {
            await parser.parseString(data, async function (err, result) {
                if (err || result === null || result === undefined) {
                    await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus?id=' + datas[0].signage[0]._id + '&status=false').on('complete', function (result) {
                        if (result instanceof Error) {
                            console.log('Error get warning:', result.message);
                            this.retry(5000); // try again after 5 sec 
                        } else {
                            console.log(result);
                        }
                    });
                } else {
                    res.json(result.data.warnings[0].reports[0].report[0].html[0]);
                }
            });
        });
    });
}

/* Warning */
exports.downloadWarning = async function (req, res, next) {
    await ActiveSignage.find({}, async function (err, datas) {
        if (err) {
            res.status(500).send("Error Parsing XML");
        } else {
            await lib.downloadFile(conf.bmkg_data, './public/tmp', datas[0].signage[0].warning_xml, function (result) {
                if (err) {
                    res.status(500).send("Error Download XML");
                } else {
                    res.json(result);
                }
            });
        }
    });
}

exports.downloadWeb = async function (file, cb) {
    await lib.downloadFile(file, function (result) {
        cb(result);
    });
}

exports.downloadGempa = async function (cb) {
    await ActiveSignage.find({}, async function (err, datas) {
        if (err) {
            res.status(500).send("Error Parsing XML");
        } else {
            let dest = './public/activeSignage/tmp/';
            let fileArr = [datas[0].signage[0].slides[3].xml];
            await lib.getFTP(fileArr, dest, function (result) {
                let downloadStatus = [];
                if (result.status == 500) {
                    cb(result.text)
                } else {
                    let ftpStatus = [];
                    for (let i = 0; i < result.value.length; i++) {
                        downloadStatus.push({
                            file: fileArr[i],
                            status: result.value[i]
                        });
                    }
                    cb(downloadStatus)
                }
            });
        }
    });
}

exports.downloadFTP = async function (fileArr, cb) {
    await ActiveSignage.find({}, async function (err, datas) {
        if (err) {
            res.status(500).send("Error Parsing XML");
        } else {
            let dest = './public/tmp/';
            await lib.getFTP(fileArr, dest, function (result) {
                let downloadStatus = [];
                if (result.status == 500) {
                    cb(result.text)
                } else {
                    let ftpStatus = [];
                    for (let i = 0; i < result.value.length; i++) {
                        downloadStatus.push({
                            file: fileArr[i],
                            status: result.value[i]
                        })
                    }
                    cb(downloadStatus);
                }
            });
        }
    });
}

exports.loadSlides = async function (req, res, next) {
    await ActiveSignage.find({}, function (err, datas) {
        if (err) {
            res.status(500).send("Error Parsing XML");
        } else {
            res.json(datas[0].signage[0].slides);
        }
    });
}

exports.loadMainConfiguration = async function (req, res, next) {
    await ActiveSignage.find({}, function (err, datas) {
        if (err) {
            res.status(500).send("Error Parsing XML");
        } else {
            res.json(datas[0].signage[0]);
        }
    });
}

exports.updateSlide = async function (file) {
    await ActiveSignage.find({}, async function (err, datas) {
        let destination = './public/activeSignage';
        let url = conf.bmkg_data;
        let file1 = {
            url: datas[0].signage[0].slides[0].xml,
            filename: signageResult.value.signage[0].slides[0].xml,
            destination: destination
        };
        let file2 = {
            url: datas[0].signage[0].slides[0].warning_xml,
            filename: signageResult.value.signage[0].slides[0].warning_xml,
            destination: destination
        };
        let file = [file1, file2]

        await lib.downloadFile(file, async function (downloadResult) {
            let fileArr = [];
            let dest = './public/activeSignage/';
            for (let i = 0; i < datas[0].signage[0].slides.length; i++) {
                if (i == 2 || i == 3) {
                    fileArr.push(datas[0].signage[0].slides[i].xml)
                } else if (i > 2) {
                    fileArr.push(datas[0].signage[0].slides[i].image)
                }
            }
            let downloadStatus = [];
            for (let i = 0; i < downloadResult.value.length; i++) {
                downloadStatus.push({
                    file: file[i].filename,
                    status: downloadResult.value[i]
                })
            }

            await lib.getFTP(fileArr, dest, function (result) {
                if (result.status == 500) {
                    res.status(500).send(result.text)
                } else {

                    let ftpStatus = [];
                    for (let i = 0; i < result.value.length; i++) {
                        downloadStatus.push({
                            file: fileArr[i],
                            status: result.value[i]
                        })
                    }
                    res.status(200).send(downloadStatus)
                }
            });
        });
    });
}

exports.checkImage = async function (req, res, next) {
    await ActiveSignage.find({}, async function (err, datas) {
        let folder = './public/activeSignage/';
        let tmpFolder = './public/tmp/';

        if (err) {
            res.status(500).send("Error Retrieve Data");
        } else {
            if (datas.length != 0) {
                let file = [];
                let fileFolder = [];
                let xmlStatus = [];

                for (let i = 0; i < datas[0].signage[0].slides.length; i++) {
                    if (datas[0].signage[0].logo.length > 1) {
                        file.push(datas[0].signage[0].logo[1])
                    }
                    if (i > 2) {
                        file.push(datas[0].signage[0].slides[i].image)
                    }
                }

                file.push(datas[0].signage[0].slides[0].background_img)

                let file2 = [];
                await fs.readdir(tmpFolder, async (err, files) => {
                    for (let i = 0; i < files.length; i++) {
                        let ext = files[i].split('.')[1];
                        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif') {
                            if (inArray(files[i], file) == true) {
                                xmlStatus.push({ status: true, file: files[i] })
                                file2.push(files[i])
                            } else {
                                xmlStatus.push({ status: false, file: files[i] })
                            }
                        }
                    }

                    await copyContent(file2, function (result) {
                        res.status(200).json(result);
                    });
                })
            } else {
                res.json('No Data');
            }
        }
    });
}

exports.checkXML = async function (req, res, next) {
    await ActiveSignage.find({}, async function (err, datas) {
        let folder = './public/activeSignage/';
        let tmpFolder = './public/tmp/';
        if (err) {
            res.status(500).send("Error Retrieve Data");
        } else {
            if (datas.length != 0) {
                let file = [];
                let totalFile = '';
                let xmlStatus = [];

                file.push(datas[0].signage[0].slides[0].xml);
                file.push(datas[0].signage[0].slides[0].warning_xml);
                file.push(datas[0].signage[0].slides[0].perairanXML);
                file.push(datas[0].signage[0].slides[3].xml);

                let file2 = [];
                for (let i = 0; i < file.length; i++) {
                    await xmlValidator(tmpFolder, file[i], function (result) {
                        xmlStatus.push(result);
                        if (result.status == true) {
                            file2.push(result.file)
                        }
                        if (xmlStatus.length == file.length) {
                            copyContent(file2, function (result) {
                                res.status(200).json(result);
                            });
                        }
                    });
                }
            } else {
                res.json('No Data');
            }
        }
    });
}

async function copyContent(files, cb) {

    let status = [];

    for (let i = 0; i < files.length; i++) {
        let source = './public/tmp/' + files[i];
        let dest = './public/activeSignage/' + files[i];

        await lib.copyFile(source, dest, function (cpResult) {
            status.push(cpResult)
            if (files.length == status.length) {
                return cb(status);
            }
        });
    }
}

async function xmlValidator(folder, file, cb) {
    let parser = new xml2js.Parser();

    await fs.readFile(folder + file, async function (err, data) {
        await parser.parseString(data, function (err, result) {
            if (err || result === undefined || result === null) {
                cb({ status: false, file: file })
            } else {
                cb({ status: true, file: file })
            }
        });
    });
}

function inArray(needle, haystack) {
    let count = haystack.length;
    for (let i = 0; i < count; i++) {
        if (haystack[i] === needle) { return true; }
    }
    return false;
}