'use strict';

var lib = require('@libraries/library');
var schedule = require('node-schedule');
var Signage = require('@models/signage');


/* Upload File */
exports.signageLoader = function() {

    var io = require('socket.io').listen(app.listen(port));
    io.sockets.on('connection', function(socket) {

        schedule.scheduleJob('*/1 * * * *', function() {
            var d = new Date();
            var h = d.getHours();


            if (h == 0) {

                socket.emit('news', { hour: '0', port: '3500' });


            } else if (h == 6) {

                socket.emit('news', { hour: '6', port: '3500' });


            } else if (h == 12) {

                socket.emit('news', { hour: '12', port: '3500' });


            } else if (h == 18) {

                socket.emit('news', { hour: '18', port: '3500' });


            } else if (h == 24) {

                socket.emit('news', { hour: '24', port: '3500' });
                console.log('24');


            } else if (h == 1) {
                socket.emit('news', { hour: '24', port: '3500' });
            }

        });

        console.log('Socket Connected');

    });

}