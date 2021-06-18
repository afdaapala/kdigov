"use strict";

console.log(`Starting System...`);
require("module-alias/register");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const flash = require('connect-flash');
const passport = require('passport');
const schedule = require('node-schedule');
const cors = require('cors');

// load config files
const confFile = require('@configs/config.json');
const conf = confFile.parameter_config;

// mongodb connection
const dbConfig = require('@configs/dbConfig.json');
const mongoose = require('mongoose');
const rest = require('restler');
mongoose.connect(dbConfig.default.url);

const port = conf.port;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
var routes = require('@routes/index');
routes(app);

//Configuring Passport
//required for passport
// require('./config/passport')(passport);
app.use(session({ secret: conf.secret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
var routes = require('./routes/routes');
routes(app, session);
require('./routes/index');
require('./routes/routes');

//initialise FTP Config
const ftp = require('@configs/initializeConfig');
ftp.initializeFTP(function (result) {
    ftp.syncFTP();
});
ftp.initializeProvince();
ftp.initializeUser();


// Session-persisted message middleware
app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// Setup server
const server = require('http').createServer(app);
server.listen(port, () => console.log(`BMKG-CLIENT running at port: ${port}`));

// socket.io handler
let counter = 0;
const io = require('socket.io').listen(server);
io.sockets.on('connection', async function (socket) {

    const signage = require('@controllers/signageDisplay');
    const ActiveSignage = require('@models/activeSignage');
    counter++
    console.log(counter)

    if (counter < 2) {
        socket.emit('update', { hour: '0', port: port });
    }

    schedule.scheduleJob('0 */1 * * *', function () {
        var d = new Date();
        var h = d.getHours();

        if (h == 0) {
            console.log(h)
            socket.emit('news', { hour: '0', port: port });
        } else if (h == 6) {
            console.log(h)
            socket.emit('news', { hour: '6', port: port });
        } else if (h == 12) {
            console.log(h)
            socket.emit('news', { hour: '12', port: port });
        } else if (h == 18) {
            console.log(h)
            socket.emit('news', { hour: '18', port: port });
        } else if (h == 24) {
            console.log(h)
            socket.emit('news', { hour: '24', port: port });
        } else if (h == 1) {
            console.log(h)
            socket.emit('news', { hour: '24', port: port });
        }

        require('dns').resolve('www.google.co.id', async function (err) {
            if (err) {
                console.log("No connection");
            } else {
                await ActiveSignage.find({}, async function (err, datas) {

                    var id = console.log(datas[0].signage[0]._id);

                    if (datas.length != 0) {
                        var file = []
                        var bgImg = [];
                        var destination = "./public/tmp";
                        var file2 = [];
                        var file3 = [];
                        var url1 = conf.bmkg_data;
                        var url2 = conf.bmkg_client + '/configFile/';

                        await rest.get(conf.bmkg_client + '/updateSignageValue/' + datas[0].signage[0]._id).on('complete', async function (result) {
                            if (result instanceof Error) {
                                console.log('Error:', result.message);
                                this.retry(5000); // try again after 5 sec
                            } else {
                                if (result == 'Done') {
                                    for (var i = 0; i < datas[0].signage[0].slides.length; i++) {
                                        var time = datas[0].signage[0].slides[i].updateEvery;
                                        if (time !== undefined) {
                                            var updateTime = time.split('.')[0]

                                            if (i == 0 && h == 11) {
                                                if (datas[0].signage[0].logo.length > 1) {
                                                    bgImg.push({
                                                        url: url2 + datas[0].signage[0].folder + '/' + datas[0].signage[0].logo[1],
                                                        filename: datas[0].signage[0].logo[1],
                                                        destination: destination
                                                    })
                                                }

                                                bgImg.push({
                                                    url: url2 + datas[0].signage[0].folder + '/' + datas[0].signage[0].slides[0].background_img,
                                                    filename: datas[0].signage[0].slides[0].background_img,
                                                    destination: destination
                                                });
                                            }

                                            if (i == 0) {
                                                file.push({
                                                    url: url1 + datas[0].signage[0].slides[0].xml,
                                                    filename: datas[0].signage[0].slides[0].xml,
                                                    destination: destination
                                                })
                                                file.push({
                                                    url: url1 + datas[0].signage[0].slides[0].warning_xml,
                                                    filename: datas[0].signage[0].slides[0].warning_xml,
                                                    destination: destination
                                                })


                                            }
                                            if (i == 2) {
                                                file2.push(datas[0].signage[0].slides[i].xml)

                                            }
                                            if (i >= 4) {
                                                file3.push(datas[0].signage[0].slides[i].image)
                                            }
                                        }
                                    }

                                    if (bgImg.length !== 0 || file3.length !== 0 || file2.length !== 0 || file.length !== 0) {
                                        await signage.downloadWeb(bgImg, async function (result) {
                                            await rest.get(conf.bmkg_client + '/checkImage').on('complete', function (result) {
                                                if (result instanceof Error) {
                                                    console.log('Error Get Bg Image:', result.message);
                                                    this.retry(5000); // try again after 5 sec
                                                } else {
                                                    //    socket.emit('update', {hour: '24', port: '3500'});
                                                }
                                            });
                                        });

                                        await signage.downloadFTP(file3, async function (result) {
                                            await rest.get(conf.bmkg_client + '/checkImage').on('complete', function (result) {
                                                if (result instanceof Error) {
                                                    console.log('Error Get Image Content:', result.message);
                                                    this.retry(5000); // try again after 5 sec
                                                } else {
                                                    //    socket.emit('update', {hour: '24', port: '3500'});
                                                }
                                            });
                                        });

                                        await signage.downloadFTP(file2, async function (result) {
                                            await rest.get(conf.bmkg_client + '/checkXML').on('complete', function (result) {
                                                if (result instanceof Error) {
                                                    console.log('Error Get XML File FTP:', result.message);
                                                    this.retry(5000); // try again after 5 sec
                                                } else {
                                                    //   socket.emit('update', {hour: '24', port: '3500'});
                                                }
                                            });
                                        });

                                        await signage.downloadWeb(file, async function (result) {
                                            await rest.get(conf.bmkg_client + '/checkXML').on('complete', function (result) {
                                                if (result instanceof Error) {
                                                    console.log('Error  Get XML File Web:', result.message);
                                                    this.retry(5000); // try again after 5 sec
                                                } else {
                                                    //  socket.emit('update', {hour: '24', port: '3500'});
                                                }
                                            });
                                        });
                                    }

                                    await rest.get(conf.bmkg_server + '/api/signage/updateSignageStatus/' + datas[0].signage[0]._id).on('complete', function (result) {
                                        if (result instanceof Error) {
                                            console.log('Error:', result.message);
                                            this.retry(5000); // try again after 5 sec
                                        } else {
                                            console.log(result);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    schedule.scheduleJob('*/10 * * * *', function () {
        require('dns').resolve('www.google.co.id', async function (err) {
            if (err) {
                console.log("No connection");
            } else {
                await ActiveSignage.find({}, async function (err, datas) {
                    if (datas.length != 0) {
                        await signage.downloadFTP([datas[0].signage[0].slides[3].xml], async function (result) {
                            await rest.get(conf.bmkg_client + '/checkXML').on('complete', function (result) {
                                if (result instanceof Error) {
                                    console.log('Error:', result.message);
                                    this.retry(5000); // try again after 5 sec
                                } else {
                                    console.log(result);
                                    //   socket.emit('update', {hour: '24', port: '3500'});
                                }
                            });
                        });

                        await signage.downloadFTP([datas[0].signage[0].slides[3].image], async function (result) {
                            rest.get(conf.bmkg_client + '/checkImage').on('complete', function (result) {
                                if (result instanceof Error) {
                                    console.log('Error:', result.message);
                                    this.retry(5000); // try again after 5 sec
                                } else {
                                    console.log(result);
                                    //  socket.emit('update', {hour: '24', port: 'masu3500'});
                                }
                            });
                        });
                    }
                });
            }
        });
    });

    // socket.emit('update', {hour: '24', port: 'masu3500'});
    console.log('Socket Connected at port: ' + port);
});