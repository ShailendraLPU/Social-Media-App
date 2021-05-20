const mongoose  = require('mongoose');


const likeSchema = mongoose.Schema({
    user:
    {

    type:String,

    },

    liked:
    [
    {
    type:mongoose.Schema.Types.ObjectId,
    }
    ]
})


const Like = mongoose.model('Like',likeSchema);

module.exports = Like;