


/*



THIS FILE IS TO MANAGE GET AND POST OPERATIONS FOR USER

main app is is index when we turn on the server, this file is only a router
that we included in the main app


*/

const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

//we replaced app.post with router.post ... when we created the router




/*
                                         //WE USE POST FOR CREATING USERS
app.post('/users', (req, res)=> {
    const user = new User(req.body)     //usually when we use mongoose to add a row in the db we pass an object with all attributes to User
                                        //here we already have the object parsed from the JSON that we received from the request


    user.save().then((user)=> {
        res.status(201).send(user)
    }).catch( (error)=> {
        res.status(400)               //to change the status code , DO IT BEFORE SEND ALWAYS
        res.send(error)
    })
})
WE WILL WRITE SAME FUNCTION USING ASYNC \/\/\/\/\/\/\/     */



router.post('/users', async(req, res) => { //here app.post does not use any returned value from the function so we dont care if it returns a promise 
    const user = new User(req.body)     
    try{    //use this to catch errors when we have one                              
        await user.save()
        //we should send an email AFTER THE USER IS SUCCESFFULY SAVED TO THE DB
        sendWelcomeEmail(user.email, user.name) //no need to wait for the email to be sent before proceeding so no need to use 'await' BUT REMEMBER THAT THIS FUNCTION IS ASYNCHRONOUS

        const token = await user.generateAuthToken()
        res.status(201).send({user: user, token: token})
    }catch (e) {
        res.status(400).send(e)
    }
     
    })
    
    



//route for users to login
//we will create a function that will find a user having a certain email and matching HASHED password
//the function will be added to the model User since we are using User.find...
router.post('/users/login', async(req, res) => {

    try{
        const user = await User.findByCredentials(req.body.email, req.body.password) //method is implented in user model 
        //the function will either return a user or it will throw an error so no need to test if(!user)

        //we will create the toke function on the specific user not the model User
        const token = await user.generateAuthToken()
        res.send({user: user, token: token})


    } catch (e){
        res.status(400).send(e)
    }


} )
    

//route to log out 
router.post('/users/logout', auth, async(req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        } )

        await req.user.save()

        res.send()
    }catch(e) {
        res.status(500).send()
    }
})




//route to log out from all sessions

router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens = [] //the array of tokens is emptied so we logged out of all sessions
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})





    
    
    /*
    
    //use get when we want to read a user
    //we have methods for queries inside mongoose same as mongodb: findOne, findMany, updateOne...
    //notice that we also used /users here but here it is a GET request not POST
    app.get('/users', (req, res) => {
        User.find({}).then((usersReceived) => { //here we do not have any filter for find so find({})
            res.send(usersReceived)
        }).catch((error) => {
           res.status(500)
           res.send(error)
        })
    })
    
        USING ASYNC \/ \/ \/ */
    /*
        router.get('/users',async(req, res) => {
        try{
            const users = await User.find({})
            res.send(users)
        }catch (e){
            res.status(500).send(e)
        }
    })

    ---------------THE METHOD /USERS is not useful bcz a user should not see all other users, we changed it to users/me -----------------------
    */


    router.get('/users/me', auth, (req, res) => { //we will use the req.user we returned from the middlewar auth
        res.send(req.user)

    })
    
    
    
    
    
    
    
    
    
    /*
    
    //now we want to access a certain user by its id
    //we can do this by adding :id or :anyName, this way we can access the id using route parameters
    //here we can either use findOne() or findById(), but since we are using id so we will use the 2nd one
    //with findOne we pass an object but with passById, we pass an id
    app.get('/users/:id', (req, res) => {
        const _id = req.params.id
    
        User.findById(_id).then( (user) => {
           if(!user){ //in case the query did not find a user with the inserted id
               return res.status(404).send('Record not found')
            }
            res.send(user)
        }).catch( (error) => {
            res.status(500).send()
        })
    })
    
     USING ASYNC \/ \/ \/   */
    

     /* WE REMOVED THIS ROUTE BCZ USERS SHOULD NO BE ABLE TO ACCESS ANOTHER USER BY ID
     router.get('/users/:id', async(req, res) => {
        const _id = req.params.id
    
        try{
            const user = await User.findById(_id)
            if(!user) {
                return res.status(404).send()
            }
            res.send(user)
        }catch (e) {
            res.status(500).send()
        }
    })
    */
    
    //NOW LETS DO THE UPDATE FOR A USER
    // when using update with mongoose , we can directly specify what we want ot update without using $set etc.. like we did with mongodb directly
    //we accessed the id of the user using params.id
    //we accessed the thing we want to change using the body of the request
    //the body of the request is JSON that was parsed , so it is an object that will contain attributes to change
    //new: true means it will return the changed object AFTER the update
    //we used updates to get array of attributes passed in body and we compared the attributes we have in our collection
    //if not all attributes are found in the list , we send an error

    /*
    router.patch('/users/:id', async(req, res) => {
        const _id = req.params.id
    
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'email', 'password', 'age']
        const isValidOperation = updates.every( (update) => { //if we get true for all elements in the array, every return true, otherwise it returns false
            return allowedUpdates.includes(update)
        })
    
        if(!isValidOperation){
            return res.status(400).send({error: 'Invalid Update'})
        }
        try{ //we will use findByIdAndUpdate()

            //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true})
           //we will replace this find and update by the code after it because when we use middleware, findByIdAndUpdate skips the pre function

            const user = await User.findById(_id)
            updates.forEach( (update)=> {
                user[update] = req.body[update]
            })

            await user.save() //when we save a user with an already existing id, means we are just updating it

            if(!user){ //in case user not found
                return res.status(404).send()
            }
            res.send(user) //to see the user after the change
        }catch (e){
            res.status(400).send() //we will have an error in case of server problem OR validation error since we have runValidators: true
        }
    })
    
    
    WE MODIFIED THIS METHOD BCZ A USER SHOULD NO BE ABLE TO DELETE ANOTHER USER
    HE SHOULD ONLY BE ABLE TO DELETE HIMSELF
    user should be authenticated before being updated, and we .remove instead of find by id and remove since
    now we have access to the user from the authentication , also i changed the url to users/me
            \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/

    
    */

    

    router.patch('/users/me',auth ,  async(req, res) => {
        const _id = req.params.id
    
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'email', 'password', 'age']
        const isValidOperation = updates.every( (update) => { //if we get true for all elements in the array, every return true, otherwise it returns false
            return allowedUpdates.includes(update)
        })
    
        if(!isValidOperation){
            return res.status(400).send({error: 'Invalid Update'})
        }
        try{ 
            

            updates.forEach( (update)=> {
                req.user[update] = req.body[update]
            })

            await req.user.save() //when we save a user with an already existing id, means we are just updating it
            
            /*User is always existing since we authenticated it
            if(!user){ //in case user not found
                return res.status(404).send()
            }
            */

            res.send(req.user) //to see the user after the change
        }catch (e){
            res.status(400).send() //we will have an error in case of server problem OR validation error since we have runValidators: true
        }
    })
















    //DELETE OPERATION
    /* 
    router.delete('/users/:id', async(req, res) => {
        const _id = req.params.id
        try{
            const user = await User.findByIdAndDelete(_id)
            if(!user){
                return res.status(404).send()
            }
            res.send(user)
        }catch( e){
            res.status(500).send()
        }
    })
    

    WE MODIFIED THIS METHOD BCZ A USER SHOULD NO BE ABLE TO DELETE ANOTHER USER
    HE SHOULD ONLY BE ABLE TO DELETE HIMSELF
    user should be authenticated before being deleted, and we .remove instead of find by id and remove since
    now we have access to the user from the authentication , also i changed the url to users/me
            \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/

    */
    


    router.delete('/users/me',auth,  async(req, res) => {
        const _id = req.params.id
        try{
            await req.user.remove()
            sendCancelationEmail(req.user.email, req.user.name)
            res.send(req.user)
        }catch( e){
            res.status(500).send()
        }
    })











    //do not forget to require multer at the beginning
    const upload = new multer({
        //we removed this field in order to let the image pass to the .post function in order to store it in database (we can access it using req.file.buffer)
       // dest: 'avatars', // //name of the file inside task-manager that we want to store our received file in(we should add .jpg to it)
        limits: {
            fileSize:1000000 //lmiit of 1 Mb
        },
        fileFilter(req, file, cb){
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/) ){  //do not forget to use /      /    around the regExp 
                cb(new Error('Please upload an image'))
            }
            cb(undefined, true)
        }
    })

//                                \/we then added auth to let a user add a profile photo specific to himself only
//                                \/     \/ we are telling multer to look for a file called 'upload' when the request /upload is received
//                                \/     \/ so we should call  the file upload in the body of the request (do not forget that it will be form-data not JSON)       
    router.post('/users/me/avatar',auth, upload.single('avatar'), async(req, res) => {
       
      //req.file.buffer is the image received in binary, req.user is the user received from auth and .avatar is the attribute inn database
      
        //here we are passing the data in the request to sharp then passing it back using toBuffer
      //in between, we resize the photo we convert all images to png 
     const buffer = await sharp(req.file.buffer).resize({width:250, height: 250}).png().toBuffer()

  req.user.avatar = buffer 
        await req.user.save()
        res.send()
    }, (error, req, res, next) => { //this function is to handle errors
        res.status(400).send({
            error: error.message //will display the message of the error received from the upload.single()
        })
    })


    router.delete('/users/me/avatar', auth, async(req, res) => {
        // const _id = req.user.id 
        // const user = await User.findByIdAndUpdate(_id, {avatar: undefined})
       //better method:
        req.user.avatar = undefined
        await req.user.save()
        res.send()
       //no need to do try and catch since user is already found in auth
    })


    router.get('/users/:id/avatar', async(req, res) => {
        try{
            const user = await User.findById(req.params.id)
            if(!user || !user.avatar) { //in case user is not found OR user does not have a profile photo
                throw new Error()
            }
            //we are telling them the type of the avatar profile photo( jpg, jpeg, png) and setting it in the header
            res.set('Content-Type', 'image/png') //Content-Type is a known header, it is usually set to application/json but here profile photo we are getting is not json
            res.send(user.avatar)                   //all photos are png so set header to png

        } catch (e) {
            res.status(404).send()
        }
    })


module.exports = router