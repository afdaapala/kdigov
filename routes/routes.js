var AuthenticationController = require('../controllers/authentication'),
    express = require('express'),
    session = require('express-session'),
    passportService = require('../config/passport'),
    controlManagement = require('../controllers/controlManagement'),
    slideManagement = require('../controllers/slideManagement'),
    userManagement = require('../controllers/user'),
    library = require('../controllers/libraryFunction'),
    passport = require('passport');
var authConfig = require('../config/auth');
const expressJwt = require('express-jwt');
const authenticate = expressJwt({secret : authConfig.secret});

var requireAuth = passport.authenticate('jwt', {session: false}),
    requireLogin = passport.authenticate('local', {session: false});

module.exports = function (app) {

    var apiRoutes = express.Router(),
        provinceRoutes = express.Router(),
        areaRoutes = express.Router(),
        ftpRoutes = express.Router(),
        controlRoutes = express.Router(),
        userRoutes = express.Router(),
        slideRoutes = express.Router(),
        libraryRoutes = express.Router(),
        authRoutes = express.Router();

    //page
    app.get('/login', AuthenticationController.loginPage);
    app.get('/registration', AuthenticationController.registerPage);
    app.get('/dashboard', controlManagement.controlManagementPage);
    app.get('/controlManagement', controlManagement.controlManagementPage);
    app.get('/slideManagement', slideManagement.slideManagementPage);
    app.get('/slideEdit', slideManagement.slideEditorPage);

    // General API
    apiRoutes.use('/lib', libraryRoutes);
    libraryRoutes.post('/upload', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']),library.uploadFile);



    // Auth API
    apiRoutes.use('/auth', authRoutes);
    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin, AuthenticationController.login);
    app.post('/loginRedirect', AuthenticationController.loginRedirect);
    authRoutes.get('/protected', requireAuth, function (req, res) {
        res.send({content: 'Success'});
    });
    authRoutes.get('/onlineUser', requireAuth, function(req, res) {
        res.status(200).json(req.user);
    });

    // Province API
    apiRoutes.use('/province', provinceRoutes);
    provinceRoutes.get('/list', controlManagement.listProvince);
    provinceRoutes.get('/count', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.countProvince);

    // Area API
    apiRoutes.use('/area', areaRoutes);
    areaRoutes.get('/syncArea/:name', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.syncArea);
    areaRoutes.get('/areaName/:name', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.getSpecificAreaByName);
    areaRoutes.get('/count', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.countArea);
    areaRoutes.get('/count/:id', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.countAreaByProvince);
    areaRoutes.get('/list/:id', controlManagement.listAreaByProvince);
    areaRoutes.get('/getArea/:id', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.getArea);
    areaRoutes.post('/saveArea', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.saveArea);

    // FTP API
    apiRoutes.use('/ftp', ftpRoutes);
    ftpRoutes.get('/list', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.listFTPConfig);
    ftpRoutes.post('/saveFTP', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.listFTPConfig);
    ftpRoutes.get('/lsFTP', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), controlManagement.lsFTP);

    // User API
    apiRoutes.use('/user', userRoutes);
    userRoutes.get('/list', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), userManagement.listUser);
    userRoutes.get('/:id', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), userManagement.getUser);
    userRoutes.post('/', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), userManagement.saveUser);
    userRoutes.delete('/remove', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), userManagement.deleteUser);

    // Slide API
    apiRoutes.use('/signage', slideRoutes);
    slideRoutes.get('/list', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.listSignage);
    slideRoutes.get('/listSignageByArea', slideManagement.listSignageByArea);
    slideRoutes.get('/perairan', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.perairan);
    slideRoutes.get('/updateSlideStatus', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.updateSlideStatus);
    slideRoutes.get('/:id', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.getSlide);
    slideRoutes.get('/updateSignageStatus',slideManagement.updateSignageStatus);
    slideRoutes.put('/updateMainSlide', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.updateMainSlide);
    slideRoutes.put('/updateSlide', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.updateSlide);
    slideRoutes.post('/', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.saveSignage);
    slideRoutes.delete('/', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.removeSignage);
    slideRoutes.post('/slide', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.saveSlide);
    slideRoutes.post('/removeSlide', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.removeSlide);
    slideRoutes.post('/upload', requireAuth, AuthenticationController.roleAuthorization(['administrator', 'operator']), slideManagement.uploadFile);


    // Set up routes
    app.use('/api', apiRoutes);

}