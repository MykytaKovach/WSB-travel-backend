// IMPORTING ESSENTIAL PACKAGES
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('./company');
const mail = require('@sendgrid/mail');
const Trip = require('./trip');
mail.setApiKey(process.env.SENDGRID_KEY);
//INITIALIZING USER SCHEMA
const userSchema = new mongoose.Schema({
    //SETTING UP FIELDS IN USER MODEL
    firstName:{
        type:String,
        required:true, //FIELD IS REQUIRED
        trim:true // TRIM UNNECESSARY SPACES ("   NAME   "=>"NAME")
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value))throw new Error('Invalid email') 
            //VALIDATES EMAIL | RETURNS ERROR IF VALIDATION FAILS
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.length<8 ||        //PASSWORD LENGTH IS BIGGER THAN OR EQUAL 8
                value.includes('password')|| //PASSWORD DOES NOT INCLUDE 'PASSWORD' IN IT
                value.toUpperCase() === value||//PASSWORD CONTAINS AT LEAST 1 CAPITAL LETTER
                value.toLowerCase()===value)//PASSWORD CONTAINS AT LEAST 1 SMALL LETTER
                throw new Error('invalid password');
        }
        
    },
    role:{
        type:String,
        required:true,
        default:"visitor",
        trim:true,
        lowercase:true

    },
    companyName:{
        type:String,
        required:true,
        trim:true,
        default:"visitor",
        uppercase:true

    },
    tokens:[{       //SAVING AUTHENTICATION TOKENS
        token:{
            type:String,
            required:true
        }
    }
        
    ]
});
//MAKING VIRTUAL PROPERTY WITH AL TASKS CREATED BY USER
userSchema.virtual('trips',{
    ref:'Trip',
    localField:'_id',
    foreignField:'createdBy._id'
});

//USER METHODS
//GENERATING AUTHENTICATING TOKEN FOR USER
userSchema.methods.generateJWT = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
    user.tokens=user.tokens.concat({token});
    await user.save();
    return token;

};

//FINDING USER WITH PASSWORD AND EMAIL
userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email});
    //CHEKING IF THERE IS A USER WITH SUCH EMAIL
    if(!user) throw new Error('unable to login');
    //CHECKING IF PASSWORD IS CORRECT
    const isMatch=await bcrypt.compare(password,user.password);
    if (!isMatch) throw new Error('unable to login');
    return user;
};


//HASHING PASSWORDS BEFORE SAVING
userSchema.pre('save',async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8);
    };
    
    
    next()
});

//CONTROLLING WHAT DATA WE SEND TO THE CLIENT
userSchema.methods.toJSON=function(){
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    return userObj;
};

//IF OWNER OF A COMPANY DELETES HIS ACCOUNT ALL WORKERS ACCOUNTS GOT DELETED TOO
userSchema.pre('remove',async function(next){
    const user = this;
    const msg = {
        to: user.email,
        from: 'trip@planner.com',
        subject: 'We are sorry!',
        text: `${user.firstName.charAt(0).toUpperCase() +user.firstName.slice(1)}, 
        we are sory that you are leaving. 
        Best regards,
        trip-planner team`
        };
        mail.send(msg);

    if(user.role === "owner"){
        //DELETE COMPANY IF OWNER IS BEING DELETED
    await Company.deleteOne({companyName: user.companyName.toUpperCase()});
        //DELETE ALL OF THE WORKERS IF OWNER IS BEING DELETED
    await User.deleteMany({companyName: user.companyName});
        //DELETE ALL OF THE COMPANY TRIPS IF OWNER IS BEING DELETED 
    await Trip.deleteMany({companyName:user.companyName});
    };
    await Trip.deleteMany({'createdBy._id':user._id});
    next();
   
});

// INITIALIZNG USER MODEL
const User = mongoose.model('User',userSchema);
 
//EXPORTING USER MODEL 
module.exports = User;