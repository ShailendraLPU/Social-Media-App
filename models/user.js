const mongoose  = require('mongoose');
const blog =  require('../models/blog');

const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
    email:
    {
        type:String,
        unique:true,
        required:true,
    },
    liked:
    [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'blog',
            unique:true
        }
    ],
    profile:
    {
        type:String
    },
    hobbies:
    [
        {
            type:String,
        }
    ]


})
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User',userSchema);


module.exports = User;
