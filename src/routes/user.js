// IMPORTING ESSENTIAL PACKAGES
const express = require('express');
const User = require('../dataBase/models/user');
const Company = require('../dataBase/models/company')
const auth = require('../middleware/auth');

// CREATING A ROUTER INSTANCE
const router = express.Router();


//GET REQUESTS
router.get('/me',auth,async (req,res)=>{
        res.status(200).send(req.user);
});
//POST REQUESTS
router.post('/users',async (req,res)=>{
    const user = new User(req.body);
    const company = new Company({
                        companyName:req.body.companyName,
                        owner:user._id
                        });
    try{
        if(user.role === "owner"){
            await company.save(); //MAKING A NEW COMPANY
            }
        if(user.role === "worker"){
            //CHECKING IF SUCH COMPANY EXISTS
            const company = await Company.findOne({companyName:user.companyName})
            if(!company) return res.status(400).send({message:'company was not found'});
        } 
        await user.save();
        //IF USER WAS CREATED AUTHENTICATE HIM AUTOMATICALY
        const token = await user.generateJWT();
        res.status(201).send({user,token})
    } catch(error){
        res.status(400).send(error)
        company.remove();
    }
});
//LOGIN
router.post('/login' ,async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateJWT();
        res.send({user,token});
    } catch(error){
        res.status(400).send(error);
    }
});
//LOGOUT
router.post('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token !== req.token;
        });
        await req.user.save();
        res.send()
    } catch(error){
        res.status(500).send(error)
    }
});
router.post('/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(error){
        res.status(500).send(error);
    }
});
//UPDATE REQUESTS
router.patch('/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body);//GETTING ONLY KEYS EG. NAME,EMAIL ETC
    const allowedupdates = ['email','password'];//SETTING FIELDS WHICH ARE ALLOWED TO UPDATE
    //CHECKING IF REQUESTED UPDATES ARE ALLOWED
    const isValid = updates.every(update=>allowedupdates.includes(update));
    if(!isValid) return res.status(400).send({message:'invald updates'});
    try{
        updates.forEach(update=>req.user[update]=req.body[update]);
        await req.user.save();
        res.status(200).send(req.user);
    } catch(error){
        res.status(400).send(error);
    }
});
//DELETE REQUESTS
 router.delete('/me',auth,async (req,res)=>{
    try{
        await req.user.remove();
        res.status(200).send(req.user);

    }catch(error){
        res.status(400).send(error);
    }
 });
//EXPORTING ROUTER
module.exports = router;