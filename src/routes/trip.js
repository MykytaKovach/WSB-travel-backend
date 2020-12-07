//IMPORTING ESSENTIAL PACKAGES
const express = require('express');

const Trip = require('../dataBase/models/trip');
const Company = require('../dataBase/models/company');
const auth = require('../middleware/auth');

//CREATING A ROUTER INSTANCE
const router = express.Router();

//GET REQUESTS
router.get('/trip/:id',auth,async(req,res)=>{
    try{
    let trip=null;
    //CHECKING IF THERE IS A TRIP CREATED BY AUTHENTICATED USER OR COMPANY OWNER
    if(req.user.role === 'owner'){
    trip = await Trip.findOne({_id:req.params.id,companyName:req.user.companyName})
    } else{
    trip = await Trip.findOne({_id:req.params.id,'createdBy._id':req.user._id});
    };
    if(!trip) return res.status(404).send({error:'Trip was not found'});
    res.status(200).send(trip);
    }catch(error){
        res.status(400).send(error);
    }
});
router.get('/trips',auth,async(req,res)=>{
    try{
        //CHECKING IF USER IS AN OWNER.IF HE IS HE'LL GET ALL TRIPS CREATED BY HIS WORKERS
        if(req.user.role ==="owner"){
            const company = await Company.findOne({companyName:req.user.companyName,owner:req.user._id});
            await company.populate('trips').execPopulate();
            return res.send(company.trips);
        }
        //IF USER IS A WORKER HE'LL GET ALL TRIPS CREATED BY HIM
        await req.user.populate('trips').execPopulate();
        res.send(req.user.trips);
    } catch(error){
        res.status(500).send(e);
    }
});

//UPDATE REQUESTS
router.patch('/trip/:id',auth,async(req,res)=>{
    //DIFFERENT ALLOWED UPDATES DEPENDING ON USER ROLE
    const allowedUpdates = req.user.role === "owner"?
    ['status'] :
    ['from','to','dateStart','dateEnd','selectedFlight','selectedReturnFlight'];
    const updates = Object.keys(req.body);
    const isValid = updates.every(update=>allowedUpdates.includes(update));
    if(!isValid) return res.status(400).send({error:'invald updates'});
    try{
    let trip=null;
    //CHECKING IF THERE IS A TRIP CREATED BY AUTHENTICATED USER OR COMPANY OWNER
    if(req.user.role === 'owner'){
    trip = await Trip.findOne({_id:req.params.id,companyName:req.user.companyName})
    } else{
        trip = await Trip.findOne({_id:req.params.id,'createdBy._id':req.user._id});
    };
        if(!trip) return res.status(404).send({error:'Trip was not found'});
        updates.forEach(update => trip[update] = req.body[update]);
        trip.createdAt = new Date();
        if(req.body.selectedFlight){
            trip.selectedFlight= JSON.stringify(req.body.selectedFlight);
        };
        if(req.body.selectedReturnFlight){
            trip.selectedReturnFlight= JSON.stringify(req.body.selectedReturnFlight);
        };
        trip.email = req.user.email;
        trip.save();
        res.status(200).send(trip);
    } catch (error){
        res.status(400).send(error);
    }
});

//CREATE REQUESTS
router.post('/trip',auth,async (req,res)=>{
    try{
        const trip = await new Trip(req.body);
        trip.createdBy={
            _id:req.user._id,
            firstName:req.user.firstName,
            lastName:req.user.lastName,
            email:req.user.email
        };
        trip.companyName = req.user.companyName;
        //STORING OBJECTS AS STRINGS
        trip.selectedFlight = JSON.stringify(req.body.selectedFlight);
        trip.selectedReturnFlight = JSON.stringify(req.body.selectedReturnFlight);
        trip.createdAt = new Date();
        trip.status = "undefined";
       await trip.save();
        res.status(201).send(trip);
    } catch(error){
        res.status(400).send(error);
    }
    
});
//DELETE REQUESTS
router.delete('/trip/:id',auth,async(req,res)=>{
    try{
        const trip = await Trip.findOneAndDelete({_id:req.params.id,'createdBy._id':req.user._id});
        if(!trip) return res.status(404).send({error:'Trip was not found'});
        res.status(200).send(trip);
    } catch(error){
        res.status(400).send(error);
    }
});


module.exports = router;