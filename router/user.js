const express = require('express'),
      ejs = require('ejs'),
      User = require('../models/user'),
      router = new express.Router(),
      bodyparser = require('body-parser'),
     auth = require('../middleware/auth'),
     jwt = require("jsonwebtoken"),
    nodemailer = require('nodemailer')
     bcrypt = require("bcrypt"),
    {generateAuthToken} = require("../services/authservice");

    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : process.env.EMAIL || 'prankeymonkey98@gmail.com',
            pass : process.env.PASSWORD || 'prankey9monkey8',
        }
    })


router.get("/", (req, res)=>{
    res.render("home");
})
router.get("/signUp", (req, res)=>{
   res.render("signUp")
})
router.post("/signUp", async(req, res)=>{
    const {name,email, password} = req.body;
    try {
        const user = await User.create({
            name,
            email,
            password,
        })
        const token = await generateAuthToken(user);
        console.log(user);
    res.redirect("/signIn");
    } catch (error) {
        console.log(user);
        res.send(error);
    }
})    
router.get("/signIn", async (req, res)=>{
    res.render("signIn")
})
router.post("/signIn", async(req, res)=>{
    const {email, password} = req.body; 
    try {
        const user = await User.findOne({email});
        if(!user)
            throw new Error("Try Again");

        user.token = [];
        await user.save();
        const matched = await bcrypt.compare(password, user.password);
        console.log("matched", matched);
        if(!matched)
            throw new Error("Try Again");
        const token = await generateAuthToken(user);
        res
          .cookie("authorization", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
          }).redirect("/user");
    } catch (error) {
        res.status(500).redirect("/signIn");
    }

})
router.post(
    "/logOut",
    auth,
    async(req, res)=>{
        
        const user = req.user;
        user.token = [];
        await user.save();
    res.redirect("/home");
})
router.get(
    "/user",
    auth,
    (req, res)=>{
        res.render("user", {user : req.user});
})
router.get(
    "/newTask",
    auth,
    (req, res)=>{
        res.render("new");
    }
)
router.post(
    "/newTask",
    auth,
    async (req, res)=>{
       try {
            const {name, description} = req.body;
            const user = req.user;
            const task ={
                name,
                description,
            }
            user.tasks.push(task);
            await user.save();
            res.redirect("/user");
       } catch (error) {
            res.send(error.message);           
       }
    }
)
router.get(
    "/tasks/:id/edit",
    auth,   
    (req, res)=>{
        const task = req.user.tasks.find(function(task){
            return task._id == req.params.id;
        })
    res.render("edit", {task:task});
})
router.put(
    "/tasks/:id/",
    auth,   
    async (req, res)=>{
        try {
            const {name, description}= req.body;
            const user = req.user;
            const id = req.params.id;
            const index = user.tasks.findIndex(function(task){
                return task._id == id;
            })
            user.tasks[index].name = name;
            user.tasks[index].description = description;
            await user.save();
            res.redirect("/user");
        } catch (error) {
            res.status(401).send("Error");
        }
})

router.delete(
    "/delete/:id",
    auth,
    async (req, res)=>{
        try {
            const id = req.params.id;
            const index = req.user.tasks.findIndex(function(task){
                return task._id == id;
            })
            req.user.tasks.splice(index,1);
            await req.user.save();
            res.redirect("/user");
        } catch (error) {
            res.status(500).send(error.message);
        }
        
    }
)


router.get(
    '/forgotpassword',
     (req ,res)=>{
    res.render("forgotpassword")
})

const JWT_SECRET = '_internship_';


router.post(
    '/forgotpassword',
     async (req, res)=>{
    const { email } = req.body;

        const user = await User.findOne({email});
        if(!user)
            res.json('Enter the email once again')
        else{
        try
        {
            const secret = JWT_SECRET + user._id;
            const payload = {
                email : user.email,
                id : user._id
            }
            const token = jwt.sign(payload, secret, {expiresIn: '15m'});
            const link = 'https://diksheetodo-app.herokuapp.com/resetpassword/' + user.id +'/' + token;
            // console.log(link);
            const mailoptions = {
                from : process.env.EMAIL || 'prankeymonkey98@gmail.com',
                to : user.email,
                subject : 'test mail',
                text : link
            }
            
            transporter.sendMail(mailoptions, function(err, info){
                if(err)
                    console.log(err);
                else console.log('Email sent');
            })
            res.json("Link has been sent to registered email");
        }catch(error){
            res.json(error.message);
        }
    }
})



router.get('/resetpassword/:id/:token', async (req, res)=>{
    const { id, token } = req.params;
    try {
        const user = await User.findById(id);
        const secret = JWT_SECRET + user._id;
        const payload = jwt.verify(token, secret);
        res.render("resetpassword", {id, token})
    } catch (error) {
        res.json(error.message);
    }
})

router.post('/resetpassword/:id/:token', async (req, res)=>{
    const { id, token } = req.params;
    const {password} = req.body;
    const user = await User.findById(id);
    try {
        
        const secret = JWT_SECRET + user._id;
        const payload = jwt.verify(token, secret);
        user.password = password;
        await user.save();
        // console.log(user);
        res.redirect("/signIn");
    } catch (error) {
        res.json(error.message);
    }
})


module.exports = router;