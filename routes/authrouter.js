const express = require('express');
const router  = express.Router();
const passport = require('passport');
const User = require('../models/user');
const cloudinary = require('cloudinary');
const uploads = require('../multer');
const Like = require('../models/like');
require('../cloudinary');

router.get('/blogs/register',(req,res)=>
{
 
  res.render('landing/signup');
})



router.post('/blogs/register',uploads.single('image'),async(req,res)=>
{
 try{
  const result = await cloudinary.v2.uploader.upload(req.file.path);
  const like = await Like.create({user:req.body.username});
  const user =new User({email:req.body.email,username:req.body.username,liked:like,profile:result.secure_url,hobbies:req.body.hobbie});
  // await user.liked.push(mongoose.Types.ObjectId());
  await User.register(user,req.body.password);
  
  
  
  req.flash('success','Registered Successfully, Login to Continue');
  res.redirect('/blogs/login');
}
  catch(e)
  {
    req.flash('error',e.message);
    res.redirect('/blogs/register');
  }
})

router.get('/blogs/login',(req,res)=>
{
  res.render('landing/login');
  // res.render('auth/login');
})

router.post('/blogs/login',passport.authenticate('local',
{
    failureRedirect: '/blogs/login',
    failureFlash: true
}
), (req, res) => {
req.flash('success', `Welcome Back!! ${req.user.username}`)
res.redirect('/blogs');
});


router.get('/blogs/logout',(req,res)=>
{
  req.logout();
  req.flash('error','Logout Successfully');
  res.redirect('/blogs/login');
})

module.exports = router;