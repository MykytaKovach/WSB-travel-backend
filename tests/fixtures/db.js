const jwt =require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/dataBase/models/user');
const Trip = require('../../src/dataBase/models/trip');
const Company = require('../../src/dataBase/models/company')

const companyOneId= new mongoose.Types.ObjectId();
const companyOne = {
    _id:companyOneId,
    firstName:"companyOneOwnerfirstname",
    lastName:"companyOneOwnerLastName",
    email:"tonedown15@gmail.com",
    password:'CompanyOne1',
    role:'OwNeR',
    companyName:'CmP1',
    tokens:[{
        token:jwt.sign({_id:companyOneId},process.env.JWT_SECRET)
    }]
};



const companyTwoId= new mongoose.Types.ObjectId();
const companyTwo = {
    _id:companyTwoId,
    firstName:"companyTwoOwnerfirstname",
    lastName:"companyTwoOwnerLastName",
    email:"nikitaKovach@gmail.com",
    password:'CompanyTwo1',
    role:'owNer',
    companyName:'cmp2',
    tokens:[{
        token:jwt.sign({_id:companyTwoId},process.env.JWT_SECRET)
    }]
};
const cmp1 = {
    companyName:companyOne.companyName,
    owner:companyOneId
};

const cmp2 = {
    companyName:companyTwo.companyName,
    owner:companyTwoId
}

const cmp1WorkerOneId= new mongoose.Types.ObjectId();
const cmp1WorkerOne = {
    _id:cmp1WorkerOneId,
    firstName:"companyOneWorker1firstname",
    lastName:"companyOneWorker1LastName",
    email:"cmp1worker1@gmail.com",
    password:'CompanyOneW1',
    role:'worker',
    companyName:companyOne.companyName,
    tokens:[{
        token:jwt.sign({_id:cmp1WorkerOneId},process.env.JWT_SECRET)
    }]
};

const cmp1WorkerTwoId= new mongoose.Types.ObjectId();
const cmp1WorkerTwo = {
    _id:cmp1WorkerTwoId,
    firstName:"companyOneWorker1firstname",
    lastName:"companyOneWorker1LastName",
    email:"cmp1worker2@gmail.com",
    password:'CompanyOneW1',
    role:'worker',
    companyName:companyOne.companyName,
    tokens:[{
        token:jwt.sign({_id:cmp1WorkerTwoId},process.env.JWT_SECRET)
    }]
};

const cmp2WorkerOneId= new mongoose.Types.ObjectId();
const cmp2WorkerOne = {
    _id:cmp2WorkerOneId,
    firstName:"companyOneWorker1firstname",
    lastName:"companyOneWorker1LastName",
    email:"cmp2worker1@gmail.com",
    password:'CompanyOneW1',
    role:'worker',
    companyName:companyTwo.companyName,
    tokens:[{
        token:jwt.sign({_id:cmp2WorkerOneId},process.env.JWT_SECRET)
    }]
};


const cmp1w1t1={
    _id:mongoose.Types.ObjectId(),
    createdAt:new Date(),
    createdBy:{
        _id:cmp1WorkerOneId,
        firstName:cmp1WorkerOne.firstName,
        lastName:cmp1WorkerOne.lastName,
        email:cmp1WorkerOne.email
    },
    companyName:cmp1WorkerOne.companyName,
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

};

const cmp1w1t2={
    _id:mongoose.Types.ObjectId(),
    createdAt:new Date(),
    createdBy:{
        _id:cmp1WorkerOneId,
        firstName:cmp1WorkerOne.firstName,
        lastName:cmp1WorkerOne.lastName,
        email:cmp1WorkerOne.email
    },
    companyName:cmp1WorkerOne.companyName,
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

};

const cmp1w2t1={
    _id:mongoose.Types.ObjectId(),
    createdAt:new Date(),
    createdBy:{
        _id:cmp1WorkerTwoId,
        firstName:cmp1WorkerTwo.firstName,
        lastName:cmp1WorkerTwo.lastName,
        email:cmp1WorkerTwo.email
    },
    companyName:cmp1WorkerTwo.companyName,
    dateStart:new Date(),
    dateEnd:new Date(),
    selectedFlight:"{\n  \"test\": \"test\"\n}",
    selectedReturnFlight:"{\n  \"test\": \"test\"\n}",
    status:"undEFined",
    to:{
        name:'town',
        code:'twn'
    },
    from:{
        name:"town2",
        code:"twn2"
    }

};

const cmp2w1t1={
    _id:mongoose.Types.ObjectId(),
    createdAt:new Date(),
    createdBy:{
        _id:cmp2WorkerOneId,
        firstName:cmp2WorkerOne.firstName,
        lastName:cmp2WorkerOne.lastName,
        email:cmp2WorkerOne.email
    },
    companyName:cmp2WorkerOne.companyName,
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

};

const cmp2w1t2={
    _id:mongoose.Types.ObjectId(),
    createdAt:new Date(),
    createdBy:{
        _id:cmp2WorkerOneId,
        firstName:cmp2WorkerOne.firstName,
        lastName:cmp2WorkerOne.lastName,
        email:cmp2WorkerOne.email
    },
    companyName:cmp2WorkerOne.companyName,
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

};


const setupDb = async ()=>{
    await User.deleteMany();
    await Trip.deleteMany();
    await Company.deleteMany();
   
  //POPULATING COMPANY
    await Company.insertMany([cmp1,cmp2]);
   //POPULATING USER
    await new User(companyOne).save();
    await new User(companyTwo).save();
    await new User(cmp1WorkerOne).save();
    await new User(cmp2WorkerOne).save();
    await new User(cmp1WorkerTwo).save();
    //POPULATING TRIP
    await Trip.insertMany([cmp1w1t1,cmp1w1t2,cmp1w2t1,cmp2w1t1,cmp2w1t2])


};

module.exports={
    companyOne,
    companyTwo,
    cmp1WorkerOne,
    cmp1WorkerTwo,
    cmp2WorkerOne,
    cmp1w1t1,
    cmp1w1t2,
    cmp1w2t1,
    cmp2w1t1,
    cmp2w1t1,
    setupDb
}
