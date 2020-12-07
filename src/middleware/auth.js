//IMPORTING ESENTIAL PACKAGES
const jwt = require('jsonwebtoken');

//IMPORTING USER MODEL
const User = require('../dataBase/models/user');

const auth = async(req,res,next)=>{
    try{
        /*REQUEST WITH AUTHENTICATION HAVE AUTHORIZATION HEADER
        WHICH STARTS WITH 'BEARER' WHICH WE DONT NEED*/
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findOne({_id:decoded._id,'tokens.token':token});
        //CHECK IF THERE IS USER WITH SUCH ID AND TOKEN
        if(!user) throw new Error();
        //ADDING TOKEN AND USER TO REQUEST SO WE CAN GET THAT USER ANYTIME WE CALL AUTH.JS
        req.token = token ;
        req.user=user;
        next()
    }catch(error){
        res.status(401).send({message:"Please authenticate"})
    }
    };

    module.exports = auth;