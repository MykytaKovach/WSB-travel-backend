// IMPORTING ESSENTIAL PACKAGES
const mongoose = require('mongoose');

//CONNECTING MONGOOSE TO DATABASE
mongoose.connect(process.env.DB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
});
