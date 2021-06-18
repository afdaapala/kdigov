'use strict';

const fs = require('fs'),
    xml2js = require('xml2js');
const Ftp = require('../models/ftpconfig');
const formidable = require('formidable');
const path = require('path');
const Promise = require('bluebird');
const rimraf = require('rimraf');
const schedule = require('node-schedule');

module.exports = {
    fetchData: async function (model, data, cb) {
        let lookedData = '';

        if (data == 'all') {
            lookedData = {};
        } else {
            lookedData = data
        }

        await model.find(lookedData, function (err, results) {
            if (results.length > 0) {
                if (err) {
                    cb({ status: 500, text: 'Failed to fetch data', value: err });
                } else {
                    cb({ status: 200, text: 'Success to fetch data', value: results });
                }
            } else {
                cb({ status: 200, text: 'No Result Found', value: {} })
            }
        });
    },
    fetchPopulationData: async function (model, data, ref, cb) {
        let lookedData = '';

        if (data == 'all') {
            lookedData = {};
        } else {
            lookedData = data
        }
        await model.find(lookedData).populate(ref).exec(function (err, results) {
            if (err) {
                cb({ status: 500, text: 'Failed to fetch data', value: err });
            } else {
                cb({ status: 200, text: 'Success to fetch data', value: results });
            }
        });
    },
    createData: async function (model, data, cb) {
        let record = new model(data);

        await record.save(function (err, result) {
            if (err) {
                cb({ status: 500, text: 'Failed to create data', value: err })
            } else {
                cb({ status: 201, text: 'Success to create data', value: result });
            }
        })
    },
    createCollectiveData: async function (model, dataArray, cb) {
        await model.insertMany(dataArray)
            .then(function (docs) {
                cb({ status: 201, text: 'Success to create data', value: docs });
            })
            .catch(function (err) {
                cb({ status: 500, text: 'Failed to create data', value: err })
            });
    },
    updateData: async function (model, data, updateValue, options, cb) {
        let lookedData = '';

        if (data == 'all') {
            lookedData = {};
        } else {
            lookedData = data
        }

        await model.find(lookedData, async function (err, data) {
            if (err) {
                cb({ status: 500, text: 'Failed to fetch data', value: err });
            } else {
                await model.update({ _id: data[0]._id }, updateValue, options, function (err, result) {
                    if (err) {
                        cb({ status: 500, text: 'Failed to update data', value: err })
                    } else {
                        cb({ status: 201, text: 'Success to update data', value: result });
                    }
                });
            }

        });
    },

    deleteData: async function (model, id, cb) {
        let lookedData = '';

        await model.findByIdAndRemove(id, function (err, result) {
            if (err) {
                cb({ status: 500, text: 'Failed to remove data', value: err });
            } else {
                cb({ status: 202, text: 'Success to remove data', value: result });
            }
        });
    },
    countData: async function (model, data, cb) {
        let lookedData = '';

        if (data == 'all') {
            lookedData = {};
        } else {
            lookedData = data
        }

        await model.count(lookedData, function (err, result) {
            if (err) {
                cb({ status: 500, text: 'Failed to count data', value: err });
            } else {
                cb({ status: 200, text: 'Success to count data', value: result });
            }
        });
    },
    xmlParsing: async function (file, cb) {
        let parser = new xml2js.Parser();

        await fs.readFile(file, async function (err, data) {
            if (data !== undefined) {
                if (err) {
                    cb({ status: 500, text: 'Failed to read file', value: err });
                } else {
                    await parser.parseString(data, function (err, result) {
                        if (err) {
                            cb({ status: 500, text: 'Error parsing XML', value: err });
                        } else {
                            cb({ status: 200, text: 'Success to parsing XML', value: result });
                        }
                    });
                }
            } else {
                if (err) cb({ status: 500, text: 'Undefined data', value: err })
            }
        });
    },
    getFTP: async function (fileArr, destination, cb) {
        await Ftp.find({}, async function (err, data) {
            if (data.length != 0) {
                if (err) {
                    cb({ status: 500, text: 'Failed to read ftp conf', value: err })
                } else {

                    // ftp
                    const ftp = require('basic-ftp');

                    let connSettings = {
                        host: data[0].ftp_config.ftp_host,
                        user: data[0].ftp_config.ftp_username,
                        password: data[0].ftp_config.ftp_password,
                        port: data[0].ftp_config.ftp_port,
                        timeout: Number.MAX_VALUE
                    }

                    const client = new ftp.Client();
                    client.ftp.verbose = true;

                    try {
                        await client.access(connSettings);
                        let status = [];

                        for (let i = 0; i < fileArr.length; i++) {
                            let moveFrom = data[0].ftp_config.ftp_path + fileArr[i];
                            let moveTo = destination + fileArr[i];

                            console.log(moveFrom);
                            console.log(moveTo);

                            await client.downloadTo(moveTo, moveFrom);
                            status.push(true);
                        }

                        cb({ status: 200, text: 'Success Download from FTP', value: status });
                    } catch (err) {
                        console.error(err);
                        cb({ status: 500, text: 'FTP Connection Error', value: {} });
                    }

                    client.close();
                }
            } else {
                cb({ status: 500, text: 'No FTP Conf Found', value: {} })
            }

        });
    },
    downloadFile: async function (fileObjArray, cb) {

        let download = require('download-file');
        let status = [];

        for (let i = 0; i < fileObjArray.length; i++) {
            let options = {
                directory: fileObjArray[i].destination,
                filename: fileObjArray[i].filename
            }

            let url = fileObjArray[i].url;

            await download(url, options, function (err) {
                if (err) {
                    console.error('Failed Download # ' + url);
                    status.push(false);
                    return;
                }

                status.push(true)
                console.log('Success Download From Site # ' + url);

                if (fileObjArray.length == status.length) {
                    cb({ status: 200, text: 'Success Download From Site', value: status })
                }

            })
        }
    },
    listFTP: async function (cb) {
        await Ftp.find({}, async function (err, data) {
            if (data.length != 0) {
                if (err) {
                    cb({ status: 500, text: 'Failed to read ftp conf', value: err })
                }

                let SFTPClient = require('sftp-promises');
                const util = require('util')

                let config = {
                    host: data[0].ftp_config.ftp_host,
                    username: data[0].ftp_config.ftp_username,
                    password: data[0].ftp_config.ftp_password,
                    port: data[0].ftp_config.ftp_port
                };
                let sftp = await new SFTPClient(config);

                await sftp.ls(data[0].ftp_config.ftp_path).then(function (list) {
                    cb({ status: 200, text: 'Failed list from FTP Source', value: list.entries })
                });
            } else {
                cb({ status: 500, text: 'No FTP Conf Found', value: {} })
            }

        });
    },
    createFolder: async function (path, mask, cb) {
        if (typeof mask == 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = '0777';
        }
        await awaitfs.mkdir(path, mask, function (err) {
            if (err) {
                if (err.code == 'EEXIST') {
                    cb({ status: 500, text: 'Folder already Exist', value: err }) // ignore the error if the folder already exists
                } else {
                    cb({ status: 500, text: 'Error creating folder', value: err });
                }
            } else {
                cb({ status: 200, text: 'Success creating folder', value: {} });
            }
        });
    },
    uploadFile: async function (file, cb) {
        let form = await new formidable.IncomingForm();
        await form.parse(file, async function (err, fields, files) {
            let old_path = files.file.path,
                file_size = files.file.size,
                file_ext = files.file.name.split('.').pop(),
                index = old_path.lastIndexOf('\\') + 1,
                file_name = old_path.substr(index),
                new_path = path.join('./public' + fields.newPath, fields.name + '.' + file_ext);

            await fs.readFile(old_path, async function (err, data) {
                await fs.writeFile(new_path, data, async function (err) {
                    await fs.unlink(old_path, function (err) {
                        if (err) {
                            cb({ status: 500, text: 'Error Uploading File', value: err })
                        } else {
                            cb({ status: 200, text: 'Success uploading file', value: {} });
                        }
                    });
                });
            });
        });
    },
    copyFile: async function (source, target, cb) {
        let rd = await fs.createReadStream(source);
        rd.on("error", function (err) {
            cb(err);
        });
        let wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            cb(err);
        });
        wr.on("close", function (ex) {
            cb();
        });
        rd.pipe(wr);

        function done(err) {
            if (err) {
                cb({ status: 500, text: 'Error Copy File', value: err })
            }
            cb({ status: 200, text: 'Success Copy file', value: {} });
        }
    },
    removeDirectory: async function (path, cb) {
        await rimraf(path, function (err) {
            console.log(err);
            if (err) {
                cb({ status: 500, text: 'Error Copy File', value: err });
            } else {
                cb({ status: 200, text: 'Success Remove Folder', value: {} });
            }
        });
    },
    scheduler: async function (config, cb) {

        await schedule.scheduleJob(config, function () {
            let d = new Date();
            let h = d.getHours();
            let m = d.getMinutes();
        });
    },
    sendEmail: function (config, cb) {


    }
};