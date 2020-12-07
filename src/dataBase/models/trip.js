//IMPORTING PACKAGES
const mongoose = require('mongoose');
const User = require('./user');
const mail = require('@sendgrid/mail');
mail.setApiKey(process.env.SENDGRID_KEY);

// INITIALIZING TASK SCHEMA
const tripSchema = new mongoose.Schema({
//SETTING UP FIELDS IN TRIP SCHEMA
createdAt : {
    type:Date,
    required:true
},
createdBy:{
    _id:{
       type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    firstName:String,
    lastName:String,
    email:String
},
companyName:{
   type: String,
   ref:'Company',
   uppercase:true
},
dateStart:{
    type:Date,
    required:true
},
dateEnd:{
    type:Date,
    required:true
},
selectedFlight:{
    type:String,
    required:true
},
selectedReturnFlight:{
    type:String,
    required:true
},
status:{
    type:String,
    required:true,
    lowercase:true
},
from:{
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    }
},
to:{
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    }
}

});

tripSchema.pre('save', async function(next){
    const trip = this;
    //SENDING EMAIL TO USER IF TRIP MADE BY HIM WAS APPROVED OR REJECTED
    if(trip.isModified('status') && trip.status!== 'undefined'){

        const msg = {
            to: trip.createdBy.email,
            from: 'trip@planner.com',
            subject: 'Check your trips!',
            text: `${trip.createdBy.firstName.charAt(0).toUpperCase() +trip.createdBy.firstName.slice(1)},
              seems like your trip to ${trip.to.name} has been updated!  
              Best regards, 
              Trip-planner team!`
        };
            mail.send(msg)
        
        };


            next();

});
//FORMATTING DATA BEFORE SENDING TO THE CLIENT
tripSchema.methods.toJSON=function(){
    const trip = this;
    const tripObj = trip.toObject();
    //CONVERTING JSON STRING TO JSON
    tripObj.selectedFlight = JSON.parse(tripObj.selectedFlight);
    tripObj.selectedReturnFlight = JSON.parse(tripObj.selectedReturnFlight);
    return tripObj;
};


//INITIALIZING TRIP MODEL
const Trip = mongoose.model('Trip',tripSchema);
//EXPORTING TRIP MODEL
module.exports = Trip;