const   express    = require("express"),
        bodyparser = require("body-parser"),
        methodoverride = require('method-override'),
        cookieparser = require("cookie-parser");
require("./db/mongoose");

const app = express(),
     port = process.env.PORT || 3000;
const userrouter = require("./router/user");

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended : true}));
app.use(cookieparser())
app.use(methodoverride("_method"));
app.use(userrouter);

app.listen(port, ()=>{
    console.log("Listening to port,", port);
}) 




