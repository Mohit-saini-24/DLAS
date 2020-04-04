const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');
const methodOverride = require('method-override')

const router = express.Router()

const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy

const User = require('./models/user');
const Committee = require('./models/committee')

app.engine('.ejs',require('ejs').__express)
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))

const MongoURI = 'mongodb://localhost/chitfund'

const mongoose = require('mongoose')
mongoose.connect(MongoURI, { useNewUrlParser: true, useUnifiedTopology: true })

const conn = mongoose.connection;

conn.on('error', error => console.log('connection error : ' + error));
conn.once('open', () => console.log('Connected to Database..'));

app.use('/', router)



passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
    async function (email, password, done) {
        let data = await User.find({ email: email })

        let credentials = data[0];
        if (credentials == null) {
            return done(null, false, { message: 'User Not Found' })
        } else if (credentials.password != password) {
            return done(null, false, { message: 'Incorrect Password' })
        } else {
            return done(null, credentials)
        }
    }
))

passport.serializeUser(function (credentials, done) {
    done(null, credentials._id)
})

passport.deserializeUser(async function (id, done) {
    await User.findById(id, function (err, credentials) {
        if (err) {
            console.log('Passport serialize error: ' + err)
        }
        done(err, credentials)
    })
})

router.use(flash())
router.use(session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: false
}))
router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))


router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('home/login.ejs')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
}))

router.get('/register', checkNotAuthenticated, async (req, res) => {
    res.render('home/register.ejs')
})

router.post('/register', async (req, res) => {

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        playMoney : 100000
    })
    try {
        await newUser.save();
        res.render('home/login.ejs')
    } catch (error) {
        console.log('Register Error : ' + error)
    }


})

router.get('/', checkAuthenticated, async (req, res) => {
    try {
        // console.log(req.user.admin)
        // if user is admin or customer, adminindex is admin dashboard, index is customer dashboard
        if (req.user.admin == 'true') {
            const allCommittee = await Committee.find({});
            const allUsers = await User.find({});
            res.render('adminindex.ejs', {allCommittee,user:req.user,allUsers})                
        } else {
            const allCommittee = await Committee.find({},{committeeName:1,committeeAmount:1,biddingFrequency:1,_id:1})
            res.render('index.ejs',{user:req.user,allCommittee})            
        }
    } catch (error) {
        console.log('inndex page render error :' + error)
    }
})

// create new committee route --admin 
router.post('/createCommittee', async (req, res) => {
    const newCommittee = new Committee({
        committeeName: req.body.committeeName,
        committeeAmount: req.body.committeeAmount,
        noOfMembers: req.body.noOfMembers,
        biddingFrequency: req.body.biddingFrequency,
        commissionPercentage: req.body.commissionPercentage,        
    });

    try {
        await newCommittee.save();
        res.redirect('/')
    } catch (error) {
        console.log('Error While creating new Committee')
    }
})

// remove committee route --admin
router.put('/:id', async(req,res) => {
    try {
        let committee = await Committee.findById(req.params.id)
        await committee.remove();
        res.redirect('/')
    } catch (error) {
        console.log('delete error: '+ error)
    }
})

// route to join a committee
router.post('/:id/join', async(req,res) => {
    try {
        let temp = []
        // check if member has already joined the committee or not
        let members = await Committee.find({_id:req.params.id},{members:1})
        if (members[0].members == ''|| members[0].members == null ) {
            // enter the unique id of logged user into members array of committee instead of name
            
            await Committee.updateOne({_id:req.params.id},{$push:{members:{id:req.user.id,name:req.user.name}}})
        } else {
            // store member id in temp array to tackle multiplicity of same user in a committee
            members[0].members.forEach((element) => {
                temp.push(element.id)
            });
            for (let i = 0; i < temp.length; i++) {
                const element = temp[i];
                if (element == req.user.id) {
                    res.redirect('/')
                    return;
                }        
            }   
            await Committee.updateOne({_id:req.params.id},{$push:{members:{id:req.user.id,name:req.user.name}}})     
        }
        res.redirect('/')
    } catch (error) {
        console.log('Error Joining Commmittee : ' + error)
    }
})

// route to view committees joined by logged user

router.get('/:id/view' , async(req,res) => {
    try {
        let allCommittee = await Committee.find({});
        if (allCommittee == '' || allCommittee == null) {
            res.redirect('/')
            return;
        }
        let userCommittee = [] // committee joined by logged user
        for (let i = 0; i < allCommittee.length; i++) {
            const element = allCommittee[i];
            if (element.members != '') {
                for (let j = 0; j < element.members.length; j++) {
                    const element2 = element.members[j];
                    if (element2.id == req.user.id) {
                        userCommittee.push(element)
                    }
                }
            }
        }
        // console.log(userCommittee)
        res.render('user/viewCommittee',{userCommittee})
    } catch (error) {
        console.log('view committee route error :'+ error)
    }
})

router.delete('/logout', (req, res) => {
    req.session.destroy(function (err) {
      res.redirect('/')
    })
})

app.listen(2000, () => console.log('Listening on Port 2000'))


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('checknot authenticated')
        return res.redirect('/')
    }
    next()
}