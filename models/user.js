var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['administrator', 'operator'],
        default: 'operator'
    }

}, {
    timestamps: true
});

UserSchema.pre('save', function(next){

    var user = this;
    var SALT_FACTOR = 5;

    if(!user.isModified('password')){
        return next();
    }

    bcrypt.genSalt(SALT_FACTOR, function(err, salt){

        if(err){
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, function(err, hash){

            if(err){
                return next(err);
            }

            user.password = hash;
            next();

        });

    });

});

UserSchema.methods.comparePassword = function(passwordAttempt, cb){

    bcrypt.compare(passwordAttempt, this.password, function(err, isMatch){

        if(err){
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    });

}

module.exports = mongoose.model('User', UserSchema);
