const express = require('express')
// const User = require('./models/user') no need for them anymore bcz we created the routers
// const Task = require('./models/task')
const { translateAliases, findByIdAndUpdate } = require('./models/user')
require('./db/mongoose')                //in order to run the code that allows us to connect to database in mongoose.js

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()

//const port = process.env.PORT || 3000
const port = process.env.PORT //we set up PORT as an environment variable
/* (process.env.PORT is used when we want to deploy our app to heroku
    but i will not do it, it will always use port 3000 on localhost */



    
//-----------------------explaining express middleware----------------------

// Without middleware: new request -> run route handler 

// With middleware : new request -> do smthg -> run route handler

//use next() to continue flow of events or send smthg to interrupt them
//always write middleware before all other app.use
/*
app.use( (req, res, next) => {
    if(req.method === 'GET'){
   res.status(503).send('Under mainit')
    }else{
        next()
    }
})
------------------------------------------------------------------
*/

/*-----------------------------EXPLAINING MULTER  -----------------------------*/

/*
const multer = require('multer')
const upload = multer({
    dest: 'images',                                        //name of the file inside task-manager that we want to store our received file in(we should add .jpg to it)
    limits:{
        fileSize: 1000000  //1Mb
    },
    
    //       \/req:request being made \/ file:info about file being uploaded \/ cb:callback to tell multer when we're done filtering 
   
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){ //do not forget to use /      /    around the regExp 
            return cb(new Error('Please upload a word document'))
        }

        cb(undefined, true)


        //syntax of cb
        //cb(new Error('Error'))
        //cb(undefined, true)   accepted
        //cb(undefined, false) file refused, but we will not use this way bcz either accepted or error
    }
})
//                                  \/ we are telling multer to look for a file called 'upload' when the request /upload is received
//                                  \/ so we should call  the file upload in the body of the request (do not forget that it will be form-data not JSON)       
app.post('/upload',upload.single('upload'), (req,res) => {
    res.send()
},(error, req, res, next) => { //this function is to handle errors
    res.status(400).send({
        error: error.message //will display the message of the error received from the upload.single()
    })
})

*/


app.use(express.json())         //it automatically parses the incoming JSON to an object that we can access in the request handlers
                                //by incoming json, we mean data received in the body of the http request

app.use(userRouter ) //to use the router of user                             
app.use(taskRouter)


//define get, post methods before listen
app.listen(port, ()=>{ //to turn on server and waits commands
    console.log('Server is up on port ' + port)
})


                               


//with hashing we cannot reverse the process, when we hash a password we cant get the original password back
//with encryption, it is possible to get back the password we encrypted
/*
const bcrypt = require('bcryptjs')
const explainingHashing = async()=> {
    const password = 'Red12345!'
    const hashedPassword = await bcrypt.hash(password, 8) //second argument is how many rounds we repeat the algorithm

    console.log(password)
    console.log(hashedPassword)

    const isMatch = await bcrypt.compare('Red12345!', hashedPassword) 
    console.log(isMatch)    //we get true if password and the hash match
}

explainingHashing()
*/


/*

const jwt = require('jsonwebtoken')

const explainingTokens = async()=> {
    //                      \/ payload        \/ secret           \/lifespan
    const token = jwt.sign({_id: 'abc123'}, 'thisismynewcourse', {expiresIn: '3 days'}) //create a token
    console.log(token)
    
    
    const data = jwt.verify(token, 'thisismynewcourse') //throw error if not verified and returns payload if valid
    console.log(data)
  }
explainingTokens()
*/



/*---------------------------explaining sending private data ---------------------------*/
/*

const pet = {
    name: 'hal'
}

pet.toJSON = function () {
   console.log('d')
   return { anaAwe: 'what I decided to return'}
}

// when we use .send() in our routes, it uses JSON.stringify implicitely
// when we setup the method toJSON inside pet, it will be called automatically 
//                 when we call stringify and we can decide what to return 

console.log(JSON.stringify(pet))

*/


/*-----------------------------explaining how to use relationship between task and user --------------------------*/

/*
const Task = require('./models/task')
const User = require('./models/user')
const main = async () => {
    // how to find a user from a task:
    // const task = await Task.findById('61d2a8def598edb034f92d84')
    // await task.populate('owner')  //so we can link the owner id of the task with its corresponding row in the users table database
    // console.log(task.owner)
    

    //how to find tasks from a user (we added a virutal attribute to user model)
    const user = await User.findById('61d2a2e5d96933957aa5289d')
    await user.populate('tasks')
    console.log(user.tasks)
}

main()

*/



/*----------------------------Explaining how to send images using multer --------------------------*/






