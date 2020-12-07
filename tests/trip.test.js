const app = require('../src/app');
const DB = require('./fixtures/db');
// const Company = require('../src/dataBase/models/company');
const Trip = require('../src/dataBase/models/trip');
const User = require('../src/dataBase/models/user');
request = require('supertest');
const mongoose = require('mongoose');


beforeEach(DB.setupDb);


            //POST TRIP

test('Should create new trip',async()=>{
    const res =await request(app)
        .post('/trip')
        .set('Authorization',`Bearer ${DB.cmp1WorkerOne.tokens[0].token}`)
        .send({
            dateStart:new Date(),
            dateEnd:new Date(),
            selectedFlight:"{\n  \"test\": \"test\"\n}",
            selectedReturnFlight:"{\n  \"test\": \"test\"\n}",
            status:"undefined",
            to:{
                name:'town',
                code:'twn'
            },
            from:{
                name:"town2",
                code:"twn2"
            }
        })
        .expect(201);
        const trip = await Trip.findById(res.body._id);
        const user = await User.findById(trip.createdBy._id);
        expect(trip).not.toBeNull();
        expect(trip.companyName).toBe(user.companyName);
        
});

test("Shouldn't create trip for not authenticated user",async()=>{
    const tripId = new mongoose.Types.ObjectId();
    await request(app)
    .post('/trip')
    .send({
        _id:tripId,
        dateStart:new Date(),
            dateEnd:new Date(),
            selectedFlight:"{\n  \"test\": \"test\"\n}",
            selectedReturnFlight:"{\n  \"test\": \"test\"\n}",
            status:"undefined",
            to:{
                name:'town',
                code:'twn'
            },
            from:{
                name:"town2",
                code:"twn2"
            }
        })
        .expect(401)
        const trip = await Trip.findById(tripId);
        expect(trip).toBeNull();
    });


         ///GET TRIP
test('Should return trip for user who created it',async()=>{
    const res = await request(app)
        .get(`/trip/${DB.cmp1w1t1._id}`)
        .set('Authorization',`Bearer ${DB.cmp1WorkerOne.tokens[0].token}`)
        .send()
        .expect(200);
         const trip = await Trip.findById(res.body._id);
         expect(trip).not.toBeNull();
});

test("shouldn't return trip who didn't create it ",async()=>{
    const res = await request(app)
    .get(`/trip/${DB.cmp1w2t1._id}`)
    .set('Authorization',`Bearer ${DB.cmp1WorkerOne.tokens[0].token}`)
    .send()
    .expect(404);
     expect(res.body._id).toBe(undefined);
});

test("Should return trip for owner of the company this trip belongs ",async()=>{
    const res = await request(app)
        .get(`/trip/${DB.cmp1w1t1._id}`)
        .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
        .send()
        .expect(200);
         const trip = await Trip.findById(res.body._id);
         expect(trip).not.toBeNull();
});

test("Shouldn't return trip for owner of the different company",async()=>{
    const res = await request(app)
    .get(`/trip/${DB.cmp1w2t1._id}`)
    .set('Authorization',`Bearer ${DB.companyTwo.tokens[0].token}`)
    .send()
    .expect(404);
     expect(res.body._id).toBe(undefined);
});

                //GET TRIPS

test("Should return all trips made by authenticated user",async()=>{
    let res = await request(app)
    .get('/trips')
    .set('Authorization',`Bearer ${DB.cmp1WorkerOne.tokens[0].token}`)
    .send()
    .expect(200);

    expect(res.body.length).toBe(2)
    res = await request(app)
    .get('/trips')
    .set('Authorization',`Bearer ${DB.cmp1WorkerTwo.tokens[0].token}`)
    .send()
    .expect(200);
    expect(res.body.length).toBe(1);
});


test("should return all trips made by company workers if authenticated user is company owner",async()=>{
    let res = await request(app)
    .get('/trips')
    .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
    .send()
    .expect(200);
    expect(res.body.length).toBe(3)
    res = await request(app)
    .get('/trips')
    .set('Authorization',`Bearer ${DB.companyTwo.tokens[0].token}`)
    .send()
    .expect(200);
    expect(res.body.length).toBe(2);
});


            //PATCH TRIP
test("Should update trip for an authenticated user",async()=>{
        
    const res = await request(app)
        .patch(`/trip/${DB.cmp1w1t1._id}`)
        .set('Authorization',`Bearer ${DB.cmp1WorkerOne.tokens[0].token}`)
        .send({selectedFlight:{changed:"changed"}})
        .expect(200)

        const trip = await (await Trip.findById(res.body._id)).toJSON();
        expect(trip.selectedFlight).toEqual({changed:"changed"});
});

test("Shouldn't update trip for an authenticated user with invalid updates",async()=>{
    await request(app)
    .patch(`/trip/${DB.cmp1w1t1._id}`)
    .set('Authorization',`Bearer ${DB.cmp1WorkerOne.tokens[0].token}`)
    .send({status:"accepted"})
    .expect(400)

    const trip = await (await Trip.findById(DB.cmp1w1t1._id));
    expect(trip.status).not.toEqual("accepted");
});

test("Should update trip for an authenticated user if user role is company owner ",async()=>{
    const res = await request(app)
    .patch(`/trip/${DB.cmp1w1t1._id}`)
    .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
    .send({status:"accepted"})
    .expect(200)

    const trip = await Trip.findById(res.body._id);
    expect(trip.status).toEqual("accepted");
});

test("Shouldn't update trip for an authenticated user if user role is company owner with invalid updates",async()=>{
    await request(app)
    .patch(`/trip/${DB.cmp1w1t1._id}`)
    .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
    .send({selectedFlight:{changed:"changed"}})
    .expect(400)

    const trip = await (await Trip.findById(DB.cmp1w1t1._id)).toJSON();
        expect(trip.selectedFlight).not.toEqual({changed:"changed"});
});


                //DELETE TRIP

test("Should delete trip with a given id",async()=>{
    await request(app)
    .delete(`/trip/${DB.cmp1w1t1._id}`)
    .set('Authorization',`Bearer ${DB.cmp1WorkerOne.tokens[0].token}`)
    .send()
    .expect(200)
    const trip = await Trip.findById(DB.cmp1w1t1._id);
    expect(trip).toBeNull();
});


test("Shouldn’t delete trip with a given id for an unauthorized user",async()=>{
    await request(app)
    .delete(`/trip/${DB.cmp1w1t1._id}`)
    .set('Authorization',`Bearer ${DB.cmp1WorkerTwo.tokens[0].token}`)
    .send()
    .expect(404)
    const trip = await Trip.findById(DB.cmp1w1t1._id);
    expect(trip).not.toBeNull();
});

