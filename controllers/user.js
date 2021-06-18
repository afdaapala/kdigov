'use strict';

var User = require('@models/user');
var Area = require('@models/area');
var lib = require('@libraries/library');

/* List User */
exports.listUser = function(req, res, next) {

    var populate = {
        path: 'area',
        model: 'Area',
    }

    lib.fetchPopulationData(User, { role: 'administrator' }, populate, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

/* Get User */
exports.getUser = function(req, res, next) {

    var id = req.body.id || req.query.id || req.params.id

    lib.fetchData(User, { _id: id }, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

/* Get User */
exports.saveUser = function(req, res, next) {

    var name = req.body.name
    var password = req.body.password
    var email = req.body.email
    var role = req.body.role
    var areaID = req.body.areaID

    var data = {
        name: name,
        email: email,
        password: password,
        role: role,
        area: areaID
    }

    lib.createData(User, data, function(result) {
        if (result.status == 500) {
            res.status(500).json(result.text);
        } else {
            var options = { upsert: true, new: true, runValidators: true };
            lib.updateData(Area, { name: "Jakarta Pusat" }, { $push: { users: result.value._id } }, options, function(result) {
                if (result.status == 500) {
                    res.status(500).send(result)
                } else {
                    res.status(200).send(result)
                }
            })

        }

    });

}

/* Get User */
exports.updateUser = function(req, res, next) {

    var id = req.body.id || req.query.id || req.params.id
    var data = req.body.data || req.query.data || req.params.data

    lib.updateData(User, { _id: id }, data, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {
            res.status(200).json(result.value);
        }
    });

}

/* Get User */
exports.deleteUser = function(req, res, next) {

    var id = req.body.id || req.query.id || req.params.id
    var areaID = req.query.areaID

    lib.deleteData(User, { _id: id }, function(result) {
        if (result.status == 500) {
            res.status(500).send(result.text)
        } else {

            console.log(areaID);

            var options = { overwrite: true, runValidators: true };
            lib.updateData(Area, { _id: areaID }, { $pull: { users: id } }, options, function(result) {
                if (result.status == 500) {
                    res.status(500).send(result.text)
                } else {

                    if (result.status == 500) res.status(500).send(result.text)

                    res.status(201).json(result.value);

                }
            })
        }
    });

}