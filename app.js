const express = require('express')  
const app = express();


const genHeader = require('./gen_header')

const bodyParser = require('body-parser')





//middleware ----

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());




app.use('/header', genHeader)


app.use((req,res,next) =>{
   res.status(404).json({
      msg:'bad url request'
   })
})

module.exports = app;