const mongoose  = require('mongoose');
const Review = require('./review');

const blogSchema = mongoose.Schema(
    {
        user:
        {
            type: String
        },
     
        title:
        {
            type: String
        },

        about:
        {
            type: String
        },

        imgurl:
        {
            type:String
        },

        desc:
        {
            type:String
        },
        reviews:
        [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
        ],
        like:
        {
            type:Number,
        }

    }
)

const Blog  = mongoose.model('Blog',blogSchema);

module.exports = Blog;



