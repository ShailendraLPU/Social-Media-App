if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const methodOverride = require('method-override');
const blogrouter = require('./routes/blogroute');
const authrouter = require('./routes/authrouter');
const app = express();


const http = require('http');

const socketio = require('socket.io');

const server = http.createServer(app);

const io = socketio(server);

const mongoose = require('mongoose');
const session =  require('express-session');
const flash = require('connect-flash');
const passport  = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const path = require('path');
const seedblog = require('./seed');
const { isLogged } = require('./middleware');
 
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false})
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

app.get('/blogs/massenger',isLogged,(req,res)=>
{
    res.render('massenger/massenger');
})
const users = [];
const user2 = {};

io.sockets.on('connection',(socket)=>
{
    socket.on('disconnect',(data)=>
    {
       
        if(users.length!=0){
            let out,outname;
            for(let i=0;i<users.length;i++)
            {
                if(users[i].id===socket.id)
                {
                  
                    outname = users[i].username;
                    out = socket.id;
                    users.splice(i,1);
                
    
                }
    
            }
            io.emit('exit',{users:users,out:out,outname:outname});
            delete user2[socket.id];
           
            
        }
        else{
            io.emit('exit',{users:users,out:socket.id,outname:-1});
            delete user2[socket.id];
           
        }

    })

    socket.on('login',(data)=>
    {
       
        users.push(
            {
                id:socket.id,
                username:data.name
            }
        )
        
        user2[socket.id] = data.name
        io.emit('userlist',
        {
            user:users,  
        })
    })
    socket.on('send_msg',(data)=>
    {
        io.emit('rcd_msg',{
            msg:data.msg,
            name:user2[socket.id],
            id:socket.id
        })
    })

    socket.on('logout',()=>
    {
        if(users.length!=0){
        let out,outname;
        for(let i=0;i<users.length;i++)
        {
            if(users[i].id===socket.id)
            {
              
                outname = users[i].username;
                out = socket.id;
                users.splice(i,1);
            

            }

        }
        io.emit('exit',{users:users,out:out,outname:outname});
    }
    else{
        io.emit('exit',{users:users,out:socket.id,outname:-1});
    }
    })


  
})





// seed();
// seedblog();







server.listen(process.env.PORT || 3000,()=>
{
    console.log("Server Listening");
})