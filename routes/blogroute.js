const express = require('express');
const Blog = require('../models/blog');
const Review = require('../models/review');
const mongoose = require('mongoose');
const router = express.Router();
const { isLogged } = require('../middleware');
const User = require('../models/user');
const cloudinary = require('cloudinary');
const uploads = require('../multer');
const path = require('path');
const Like = require('../models/like');
const { Mongoose } = require('mongoose');

require('../cloudinary');

router.get('/', (req, res) => {
    res.render('landing/landing');
})


router.get('/blogs/massenger', (req, res) => {
    res.render('massenger/massenger');
})

router.get('/blogs', isLogged, async (req, res) => {

    try {
        const blogs = await Blog.find({}).populate('reviews');
        res.render('home',{blogs});
    }
    catch (e) {
        req.flash('error', 'Something Went Wront');
        res.redirect('/error');
    }
})

router.post('/blogs',isLogged,uploads.single('image'),async (req,res)=>{
    try {
         const result = await cloudinary.v2.uploader.upload(req.file.path);
         const blogs = await Blog.create({like:0,imgurl:result.secure_url,user:req.user.username,...req.body.Blog});
         req.flash('success','Post Created Successfully')
         res.redirect(`blogs/userblogs/${req.user.username}`);
    }
    catch (e) {
        req.flash('error',e.message);
        res.redirect('/error');
    }
})


router.get('/blogs/userblogs/:user', isLogged, async (req, res) => {
    try {
        const myblogs = await Blog.find({ user: req.params.user }).populate('reviews');
        const blogs = await Blog.find({});
        res.render('myblogs', { blogs,myblogs });
    }
    catch (e) {
        req.flash('error', 'Something Went Wront');
        res.redirect('/error');
    }
   
})


router.get('/blogs/newblog', isLogged, async(req, res) => {

    const blogs = await Blog.find({});
    res.render('newblog',{blogs});
})


router.get('/blogs/edit/:id', isLogged, async (req, res) => {
    
    const blogs = await Blog.find({});;
    const blog = await Blog.findById(req.params.id);
    res.render('editblog', {blog,blogs});
})


router.patch('/blogs/:id', isLogged, async (req, res) => {

    const blog = await Blog.findByIdAndUpdate(req.params.id,req.body.blog);
    res.redirect(`/blogs/userblogs/${req.user.username}`);

})


router.post('/blogs/like/:userid/:id', isLogged, async(req, res) => {
    const { userid, id } = req.params;
    const user = await User.findById(userid);
    const like = await Like.findById(user.liked);

    
    await like.liked.forEach(async element => {
         if(element._id == id) {
         await Like.findByIdAndUpdate(user.liked,{$pull:{liked:req.params.id}});
         const blog = await Blog.findById(req.params.id);
         const blog1 = await blog.like - 1;
         await Blog.findByIdAndUpdate(req.params.id,{$set:{like:blog1}});
         if(req.query.name=="usersblog"){
            res.redirect(`/blogs/userblogs/${req.user.username}`);}
           else{ 
            res.redirect(`/blogs`);
           }
        }
    });
    const item =  await like.liked.push(id);
    await like.save();
    const blog = await Blog.findById(id);
    const blog1 = await blog.like + 1;
    await Blog.findByIdAndUpdate(id,{$set:{like:blog1}});
    if(req.query.name=="usersblog"){
        res.redirect(`/blogs/userblogs/${req.user.username}`);
    }
    else
       { 
        res.redirect('/blogs');
       }
    
});



router.put('/blogs/comment/:id', isLogged, async (req, res) => {
    const blog = await Blog.findById(req.params.id);

    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);

    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    let year = date_ob.getFullYear();

    let hours = date_ob.getHours();

    let minutes = date_ob.getMinutes();

    let seconds = date_ob.getSeconds();
    let str = year + "-" + month + "-" + date + " " + hours + ":" + minutes;

    const review = new Review({
        user: req.user.username,
        date: str,
        ...req.body
    });

    blog.reviews.push(review);
    await review.save();
    await blog.save();
    res.redirect('/blogs');
})


router.delete('/blogs/comment/:blogid/:id', isLogged, async (req, res) => {
    const {blogid,id} = req.params; 
    await Blog.findByIdAndUpdate(blogid,{$pull:{reviews:id}});
    await Review.findByIdAndDelete(id);
    res.redirect(`/blogs/userblogs/${req.user.username}`);

})


router.delete('/blogs/usersblog/:id', isLogged, async (req, res) => {
    
    const blog = await Blog.findByIdAndDelete(req.params.id);
    res.redirect(`/blogs/userblogs/${req.user.username}`);

})


router.get('/error', (req, res) => {
    res.render('error');
})


module.exports = router;