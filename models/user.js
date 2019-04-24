/**
 * Created by patrykmazurkiewicz on 15/06/2017.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//user model
const itemSchema = new Schema({
    name: {type: String, required: true},
}, {
    usePushEach: true,
});

const userSchema = new Schema({
    email: { type: String, unique: true, lowercase: true, required: true },
    password: { type: String, required: true },
    status: { type: String, lowercase: true, required: true, enum: ['user', 'admin', 'sadmin', 'ban'] },
    name: { type: String },
    lname: { type: String },
    items: [ itemSchema ],
}, {
    usePushEach: true,
});

//pre-saving hook
// userSchema.pre('save', function (next) {
//     const user = this; //instance of user model
// });

userSchema.methods.comparePassword = function(potentialPassword, clb) {
    bcrypt.compare(potentialPassword, this.password, function (err, isMatch) {
        if (err) { clb(err); }

        clb(null, isMatch);
    })
};

//model class
const UserModelClass = mongoose.model('user', userSchema);
const ItemModelClass = mongoose.model('item', itemSchema);

module.exports = {
    UserModelClass: UserModelClass,
    ItemModelClass: ItemModelClass,
};
