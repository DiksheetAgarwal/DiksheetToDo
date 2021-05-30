const mongoose = require('mongoose');

mongoose.connect(
    'mongodb+srv://Diksheet:Diksheet@cluster0.sgxuy.mongodb.net/todo?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    }, 
    (err)=>{
        if (err) {
            console.log("Error");
            console.error(err);
        } else console.log("Database Connected!");
    }
);
