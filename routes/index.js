'use strict';

const fs = require('fs'),
    xml2js = require('xml2js');
const conf = require('@models/signage');
const ftp = require('@models/ftpconfig');
const legend = require('@configs/config');
const signage = require('@controllers/signageDisplay');

module.exports = function (app) {

    /* GET home page. */
    app.get('/', signage.signagePage);
    app.get('/registerSignage', signage.registerSignagePage);
    app.post('/activateSignage', signage.activateSignage);
    app.get('/updateSignageValue/:id', signage.updateSignageValue);
    app.get('/checkImage', signage.checkImage);
    app.get('/checkXML', signage.checkXML);

    /* GET XML. */
    app.get('/getSlide1/:hour', signage.getSlide1);
    app.get('/getSlide2/:hour', signage.getSlide2);
    app.get('/getSlide3', signage.getSlide3);
    app.get('/getSlide4', signage.getSlide4);
    app.get('/getPerairanUtama', signage.getMainPerairan);
    app.get('/loadSlides', signage.loadSlides);
    app.get('/checkSignage', signage.signageConfig);
    app.get('/downloadWarning', signage.downloadWarning);
    app.get('/getWarning', signage.getWarning);
    app.get('/loadMainConfiguration', signage.loadMainConfiguration);
    app.get('/updateSlide', signage.updateSlide);
    app.get('/updateGempa', signage.downloadGempa);
    app.get('/checkConnection', signage.checkConnection);
    app.get('/activeSignage', signage.signageConfig)


}
