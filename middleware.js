const User = require("./models/user")

const isLogged = (req,res,next)=>
{
    if(!req.isAuthenticated())
    {
         req.flash('error','Login To Continue');
         return res.redirect('/blogs/login');
    }
    next();
}


module.exports = {
    isLogged
}