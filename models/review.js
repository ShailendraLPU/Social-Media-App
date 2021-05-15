const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        user:
        {
            type:String,
        },
        date:
        {
            type:String
        },
        comment:
        {
            type:String
        }
    }
)

const Review  = mongoose.model('Review',reviewSchema);
module.exports= Review;