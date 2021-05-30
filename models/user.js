const mongoose = require("mongoose"),
        bcrypt = require("bcrypt");
        bcrypt

const userschema = new mongoose.Schema({
    name: {
        type: String, 
        required : true,
    },
    password : {
        type: String,
        require : true,
    },
    email:{
        type: String,
        require: true,
        unique: true,
    },
    token:[
        {
            type : String,
        }    
    ],
    tasks: [
        {
            name:{
                type : String,
                required:true,
            },
            description:{
                type: String
            }

        }
    ]
})

userschema.pre("save", async function (next) {
    const user = this;
   
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model("User", userschema);
module.exports = User;