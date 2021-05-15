if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const methodOverride = require('method-override');
const blogrouter = require('./routes/blogroute');
const authrouter = require('./routes/authrouter');
const app = express();
const mongoose = require('mongoose');
const session =  require('express-session');
const flash = require('connect-flash');
const passport  = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const path = require('path');
const seedblog = require('./seed');
 
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then(e=>
    {
        console.log("DB connected Succesfully");
    })
.catch(e=>{
    console.log(e.message);
})


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use('/public',express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'weneedsomebettersecret',
    resave: false,
    saveUninitialized: true
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentuser =req.user; 
    res.locals.flag = 0;
    next();
})


app.use(blogrouter);
app.use(authrouter);






// seed();
// seedblog();







app.listen(process.env.PORT || 3000,()=>
{
    console.log("Server Listening");
})