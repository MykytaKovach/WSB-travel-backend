// IMPORTING ESSENTIAL PACKAGES
const express = require('express');
const cors = require('cors');
require('./dataBase/mongoose');
//IMPORTING ROUTES
const userRouter = require('./routes/user');
const tripRouter = require('./routes/trip');

const app = express();

//CONFIGURING EXPRESS INSTANCE
app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(tripRouter);


//RUN THE SERVE

module.exports=app;