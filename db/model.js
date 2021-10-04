var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    role: String,
    quota: [ 
        { 
            _id: false,
            daily: { type: Number, min: 75 },
            date_added: String,
            total_slp_today: Number
        }
    ],
    total_slp: Number,
}, { collection: 'qouta' });

module.exports = mongoose.model('User', UserSchema);    