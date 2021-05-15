const express = require('express');
const Blog = require('../models/blog');
const Review = require('../models/review');
const router = express.Router();
const { isLogged } = require('../middleware');
const User = require('../models/user');
const cloudinary = require('cloudinary');
const uploads = require('../multer');
const path = require('path');
// const { startSession } = require('../models/user');
require('../cloudinary');

router.get('/', (req, res) => {
    res.render('landing/landing');
})


router.get('/blogs/massenger', (req, res) => {
    // res.sendFile('/public/index.html');
})

router.get('/blogs', isLogged, async (req, res) => {

    try {
        const blogs = await Blog.find({}).populate('reviews');
        res.render('home', { blogs });
    }
    catch (e) {
        req.flash('error', 'Something Went Wront');
        res.redirect('/error');
    }
})

router.post('/blogs',isLogged,uploads.single('image'),async (req,res)=>{
    try {
         const result = await cloudinary.v2.uploader.upload(req.file.path)
         const blogs = await Blog.create({imgurl:result.secure_url,like:0,...req.body.Blog});
         res.redirect(`blogs/userblogs/${req.user.username}`);
    }
    catch (e) {
        req.flash('error',e.message);
        res.redirect('/error');
    }
})


router.get('/blogs/userblogs/:user', isLogged, async (req, res) => {
    try {
        const blogs = await Blog.find({ user: req.params.user }).populate('reviews');
        res.render('myblogs', { blogs });
    }
    catch (e) {
        req.flash('error', 'Something Went Wront');
        res.redirect('/error');
    }
   
})


router.get('/blogs/newblog', isLogged, (req, res) => {
    res.render('newblog');
})


router.get('/blogs/edit/:id', isLogged, async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render('editblog', { blog });
})


router.patch('/blogs/:id', isLogged, async (req, res) => {

    const blog = await Blog.findByIdAndUpdate(req.params.id,req.body.blog);
    res.redirect(`/blogs/userblogs/${req.user.username}`);

})


router.post('/blogs/like/:userid/:id', isLogged, async (req, res) => {
    const { userid, id } = req.params;
    const user = await User.findById(userid);
    
    await user.liked.forEach( element => {
        if (element._id == id) {
            if(req.query.name=="usersblog"){
            res.redirect(`/blogs/dislike/${userid}/${id}?name=usersblog`);}
            res.redirect(`/blogs/dislike/${userid}/${id}`);
        }
    });
    await user.liked.push(id);
    await user.save();
    const blog = await Blog.findById(id);
    const blog1 = await blog.like + 1;
    await Blog.findByIdAndUpdate(id, { $set: { like: blog1 } });
    console.log(req.query.name=="usersblog");
    if(req.query.name=="usersblog"){
        res.redirect(`/blogs/userblogs/${req.user.username}`);}
        
        res.redirect(`/blogs`);
    
});


router.get('/blogs/dislike/:userid/:id', isLogged, async (req, res) => {
  
    const blog = await Blog.findById(req.params.id);
    const blog1 = await blog.like - 1;
    await Blog.findByIdAndUpdate(req.params.id, { $set: { like: blog1 } });
    const user = await User.findByIdAndUpdate(req.params.userid, { $pull: { liked: req.params.id } });
    // await user.save();
    console.log(req.query.name=="usersblog");
    if(req.query.name=="usersblog"){
    res.redirect(`/blogs/userblogs/${req.user.username}`);}
    res.redirect(`/blogs`)

})


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
    // res.send("hii")
    const blog = await Blog.findByIdAndDelete(req.params.id);
    res.redirect(`/blogs/userblogs/${req.user.username}`);

})


router.get('/error', (req, res) => {
    res.render('error');
})


module.exports = router;