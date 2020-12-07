const app = require('../src/app');
const DB = require('./fixtures/db');
const User = require('../src/dataBase/models/user');
const Company = require('../src/dataBase/models/company');
const Trip = require('../src/dataBase/models/trip');
const request = require('supertest');
const mongoose = require('mongoose');




beforeEach(DB.setupDb);

                    //POST USER

test('Should create new user and a new company',async()=>{
    const res = await request(app)
        .post('/users')
        .send({	firstName:"John",
        lastName:"Smith",
        email:"test@test.test",
        password:"Test1234",
        role:"owner",
        companyName:"test"})
        .expect(201);
        //CHECKING IF USER WAS CREATED
        const user = await User.findById(res.body.user._id);
        expect(user).not.toBeNull();
        // CHECKING IF COMPANY WAS CREATED
        const company =  await Company.findOne({
                 companyName:user.companyName,
                 owner:user._id});
        
        expect(company).not.toBeNull();

});

test("Shouldn't create new user if email is already taken",async()=>{
    const id = new mongoose.Types.ObjectId();
    await request(app)
     .post('/users')
     .send({firstName:"John",
     _id:id,
     lastName:"Smith",
     email:DB.companyOne.email,
     password:"Test1234",
     role:"owner",
     companyName:"test"})
     .expect(400)
    
     //CHECKING IF USER WAS CREATED
     const user = await User.findById(id);
     expect(user).toBeNull();
     // CHECKING IF COMPANY WAS CREATED
     const company = await Company.findOne({companyName:"test",owner:id});
     expect(company).toBeNull();

});


test("Shouldn't create a new user if company already exists",async()=>{
    const id = new mongoose.Types.ObjectId();
    await request(app)
        .post('/users')
        .send({	firstName:"John",
        _id:id,
        lastName:"Smith",
        email:"test@test.test",
        password:"Test1234",
        role:"owner",
        companyName:DB.companyOne.companyName})
        .expect(400);
        //CHECKING IF USER WAS CREATED
        const user = await User.findById(id);
        expect(user).toBeNull();

});


test("Should create a new worker to an exisitng company",async()=>{
    const res = await request(app)
        .post('/users')
        .send({	firstName:"John",
        lastName:"Smith",
        email:"test@test.test",
        password:"Test1234",
        role:"worker",
        companyName:DB.companyOne.companyName})
        .expect(201);
        //CHECKING IF USER WAS CREATED
        const user = await User.findById(res.body.user._id);
        expect(user).not.toBeNull();
        // CHECKING IF COMPANY WAS CREATED

});

test("Shouldn't create a new worker if company doesn't exist",async()=>{
    const id = new mongoose.Types.ObjectId();
    const res = await request(app)
        .post('/users')
        .send({	firstName:"John",
        _id:id,
        lastName:"Smith",
        email:"test@test.test",
        password:"Test1234",
        role:"worker",
        companyName:"test"})
        .expect(400);
        //CHECKING IF USER WAS CREATED
        const user = await User.findById(id);
        expect(user).toBeNull();
        // CHECKING IF COMPANY WAS CREATED
        const company = await Company.findOne({companyName:"test",owner:id});
        expect(company).toBeNull();

});


                    //POST LOGIN


test('Should login existing user',async ()=>{
    const res = await request(app)
    .post('/login')
    .send({
        email:DB.companyOne.email,
        password:DB.companyOne.password
    }).expect(200);
    const user = await User.findById(res.body.user._id);
    expect(user).not.toBeNull();
    expect(res.body.token).toBe(user.tokens[1].token)
    
});


test("Shouldn't login with wrong credentials" ,async ()=>{
    await request(app)
    .post('/login')
    .send({
        email:'some@email.wrong',
        password:DB.companyOne.password
    }).expect(400);
});


                //GET ME

test("Should return authenticated user",async()=>{
    await request(app)
        .get('/me')
        .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
        .send()
        .expect(200)
});

test("Shouldn't return not authenticated user",async()=>{
    await request(app)
        .get('/me')
        .send()
        .expect(401)
});


test("Should update authenticated user with proper updates",async()=>{
    await request(app)
    .patch('/me')
    .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
    .send({
        email:"changed@email.test"
    })
    .expect(200)
    const user = await User.findById(DB.companyOne._id);
    expect(user.email).toEqual("changed@email.test")
});

test("Shouldn't update authenticated user with unallowed updates",async()=>{
    await request(app)
    .patch('/me')
    .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
    .send({
        firstName:"changed@email.test"
    })
    .expect(400)
    const user = await User.findById(DB.companyOne._id);
    expect(user.email).not.toEqual("changed@email.test")
});


//NEW
test("Shouldn't update not authenticated user",async()=>{
    await request(app)
    .patch('/me')
    .send({
        email:"changed@email.test"
    })
    .expect(401)
});

                    //DELETE ME
test("Should delete authenticated user",async()=>{
    const res = await request(app)
        .delete('/me')
        .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
        .send()
        .expect(200);
    const user = await User.findById(res.body._id);
    expect(user).toBeNull();
});

test("Shouldn't delete not authenticated user",async()=>{
     await request(app)
        .delete('/me')
        .send()
        .expect(401);
});

//new
 test("Should delete all workers,trips and company if the company owner is being deleted",async()=>{
    const res = await request(app)
        .delete('/me')
        .set('Authorization',`Bearer ${DB.companyOne.tokens[0].token}`)
        .send()
        .expect(200);
    const users = await User.find({companyName:res.body.companyName});
    expect(users.length).toBe(0);
    const trips = await Trip.find({companyName:res.body.companyName})
    expect(trips.length).toBe(0);
    const company = await Company.findOne({companyName:res.body.companyName,owner:res.body._id})
    expect(company).toBeNull();
});




