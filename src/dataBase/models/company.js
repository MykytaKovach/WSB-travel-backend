// IMPORTING ESSENTIAL PACKAGES
const mongoose = require('mongoose');

const companySchema=new mongoose.Schema({
    companyName:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        uppercase:true

    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
});

//MAKING VIRTUAL PROPERTY company.trips
companySchema.virtual('trips',{
    ref:'Trip',
    localField:'companyName',
    foreignField:'companyName'
});


const Company = mongoose.model('Company',companySchema);
module.exports=Company;
