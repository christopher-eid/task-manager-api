
/*






THIS CODE IS ONLY USED TO EXPLAIN CRUD OPERATIONS
IT WAS NOT USED IN OUR APPLICATION



*/






//CRUD : create read update delete
/*
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID

        FASTER WAY TO DO IT USING DESTRUCTURING
    \/ \/ \/ \/ \/ \/ \/ \/ \/ \/                               */
const {MongoClient, ObjectID} = require('mongodb')
/*  /\ /\ /\ /\ /\ /\ /\ /\ /\ /\                               */

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

//ABOUT IDS
// const id = new ObjectID()
// console.log(id.id.length)
// console.log(id.getTimestamp())
// console.log(id.toHexString().length)


MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => { //closing bracket for this function is after comments for insert
    if (error){
        return console.log('Unable to connect to database')
    }

    const db = client.db(databaseName) /*we can use a new name, the command will create a new database by itself*/








})






















/*---HOW TO INSERT ONE AND INSERT MANY --- */
    
   /* 
    db.collection('users').insertOne({
        name : 'Vikran',
        age: 19
     }, (error, result) => {
        if(error){
            return console.log('Unable to insert user')
        }

        console.log(result) //ops is an array of documents, in this case one document only
    }) //we use a callback function with insertOne, we get error if error, and some data if things went OK
    */


/*
db.collection('users').insertMany([
    {
        name:  'Jen',
        age: 28
    },{
        name: 'Gunther',
        age: 27
    }
], (error, result) => {
    if(error){
       return  console.log('Unable to insert documents')
    }

    console.log(result)
})
*/


/*
db.collection('tasks').insertMany([
    {
        description: 'desc1',
        completed: true
    },
    {
        description: 'desc2',
        completed: false
    },
    {
        description: 'desc3',
        completed: true
    }

], (error, result) => {
    if(error){
        return console.log('Unable to connect to database')
    }

    console.log(result)

})
*/


//--------------------------------------READ-------------------------

    /*findOne has a callback function
    db.collection('users').findOne({_id: new ObjectID("61c45631b795c4b352cb7220")}, (error, resultQuery) => {
        if(error){
            console.log('Unable to fetch')
        }else{ //if we found the record
            console.log(resultQuery)
        }

    })
    */
    /*when we use find , no callback, we directly get an array back*/
    /*ADVANTAGE OF RETURNED CURSOR FROM FIND IS THAT WE CAN DO COUNT AND OTHER OPERATIONS*/
    /*
    db.collection('users').find({age: 19}).toArray( (error, resultUsers) => {
        if(error){
            console.log('failed')
        }else{
            console.log(resultUsers)
        }
    })

    
    db.collection('users').find({age: 19}).count( (error, usersCount) => {
        if(error){
            console.log('failed')
        }else{
            console.log('Count ' + usersCount)
        }
    })
    */

    /*------------CHALLENGE------ find and findOne*/
/*
    db.collection('tasks').findOne({_id : new ObjectID("61c44d8640eb51a579f0bc54")}, (error, result) => {
        if(error){
            console.log('Unable to find result')
        }else{
            console.log(result)
        }
    })
    db.collection('tasks').find({completed: false}).toArray( (error, resultTasks) => {
        if(error){
            console.log('Unable to find result')
        }else{
            console.log('-------------------------------------------')
            console.log(resultTasks)
        }

    })
    
*/
    

//------------------------------------update----------------------------
 
    /*update uses promises if no callback was passed*/
   /* 
   const updatePromise = db.collection('users').updateOne({
        _id: new ObjectID("61c4410c784292ca32a1bddc")
    }, {
        $inc: {                         //do not forget to use mongob db update operators like $set to change , $inc to add
            age: 1
        }
    })                //the callback would have been added after the } but here we used promise
                     //since updatePromise is a promise so it directly has .then and .catch functions 

                     
    
    updatePromise.then((result)=> {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })
*/

    //NOTE THAT WE CAN CHAIN DIRECTLY THE PROMISE AND ITS CALL, i will do it in updateMany
    //no need to use const since we are directly calling it 
    
 /*   
    db.collection('tasks').updateMany({
        completed: false
    }, {
        $set:{
            completed: true
        }
    }).then( (result) => {
        console.log(result)
    }).catch( (error) => {
        console.log(error)
    })
*/
    


    /*------------------------------------DELETE---------------------------------*/

    //with delete when we dont use callbacks, we have promises, same as update
    /*
    db.collection('users').deleteMany({
        age:27
    }).then( (result) => {
        console.log(result)
    }).catch( (error) => {
        console.log(error)
    })
    */

    /*
    db.collection('tasks').deleteOne({
        description: 'desc1'
    }).then( (result) => {
        console.log(result)
    }).catch( (error) => {
        console.log(error)
    })
    */



