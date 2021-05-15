const express = require('express');

const router  = express.Router();

const passport = require('passport');
const User = require('../models/user');


router.get('/blogs/register',(req,res)=>
{
 
  res.render('landing/signup');
})



router.post('/blogs/register',async(req,res)=>
{
 try{
  const user = new User({email:req.body.email, username:req.body.username});
  await User.register(user,req.body.password);
  req.flash('success','Registered Successfully, Login to Continue');
  res.redirect('/blogs/login');}
  catch(e)
  {
    req.flash('error',"User is Registered with same email");
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