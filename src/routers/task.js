

/*



THIS FILE IS TO MANAGE GET AND POST OPERATIONS FOR TASK

main app is is index when we turn on the server

*/









const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()










/*
app.post('/tasks', (req, res) => {
    const task = new Task(req.body)

    task.save().then((task) => {
        res.status(201).send(task)
    }).catch((error) => {
        res.status(400)
        res.send(error)
    })
})

USING ASYNC \/ \/ \/ */

router.post('/tasks',auth, async(req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body, //this will copy the attributes of the object from the body into the request
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch (e){
        res.status(400).send(e)
    }
})

/*
app.get('/tasks', (req, res) => {
    Task.find({}).then((result) => {
        res.status(201).send(result)
    }).catch( (error)=> {
        res.status(500).send(error)
    })
})
USING ASYNC \/ \/ \/ */

/*
router.get('/tasks', async(req, res) => {
    try{
        const tasks = await Task.find({})
        res.send(tasks)
    }catch(e) {
        res.status(500).send(e)
    }

})

WE MODIFIED THIS WHEN WE ADDED RELATIONSHIP BETWEEN TASK AND USER SO NOW WE CAN ONLY GET TASKS FOR 
THE USER THAT HAS LOGGED IN (use authentication)
*/

//we added some parameters to get all tasks for ex: GET /tasks?completed=true will only get completed tasks
//use match inside the function to do it

//after doing that, we will use limit and skip to do pagination
//      GET /tasks?limit=10&skip=10 means we will get a page of 10 results, starting from the 11th since we skipped the first 10
//use options inside the function to do it


//after that, we will do sorting by specifying by which attribute to sort and then add asc or desc to specify order and seperate them by a special character
// GET /tasks?sortBy=createdAt:
router.get('/tasks', auth, async(req, res) => {
    const match = {}   //we used an object to setup filters bcz the user may not use any
                        //      so we have to leave the filters empty in that case 
                        //        so we cannot provide our info directly inside populate

    if(req.query.completed){ //if a value for completed was provided
        //req.query.completed will return a string 'true' or 'false' not a boolean
        //but match.completed is a boolean thats why we write it like this
        match.completed = (req.query.completed === 'true') //if the string is true , match.completed will be true
    }

    const sort = {}      //here we have same as match bcz user may not use filters

    if(req.query.sortBy){ //if we have a value for sortBy, we have to split the value to get attribute and order
        const parts = req.query.sortBy.split(':') //parts will be an array containing the divided parts, so attribute at index 0 and order at index 1
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1  //  we get -1 when condition is true and 1 if not
    }


    try{
       // first method: find all tasks from task table with the owner id that has logged in
        //  const tasks = await Task.find({owner: req._id})

        //second method: using populate and the virtual attribute from user table 
        //with populate we can choose what we want to get from our request
       await req.user.populate(
           {
           path: 'tasks',
           match: match,   //we will search rows filtering them by the attributes inside the object match
           options:{
               limit: parseInt(req.query.limit),  //when we have a limit attribute, it will be a string but limit and skip
               skip:  parseInt(req.query.skip),    //        need a number so we have to parse 
               sort: sort  
            //    //sort: { this is an example if we wanted to sort according the attribute 'completed' in ascending order(1)
            //        completed: true
            //    }
             }
            } 
         )

        res.send(req.user.tasks) //now that we used populate we can use the virtual attribute tasks
    } catch(e){
        res.status(500).send()
    }
})




/*
app.get('/tasks/:id', (req, res) => {
    const _id = req.params.id
    Task.findById(_id).then( (result) => {
        if(!result){
            res.status(404).send('Record not found')
        }
        res.send(result)
    }).catch( (error)=> {
        res.status(500).send(error)
    })
})
 USING ASYNC \/ \/ \/ */
/*
 router.get('/tasks/:id', async(req, res) => {
    const _id = req.params.id
    try{
        const task = await Task.findById(_id)
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch (e){
        res.status(500).send(e)
    }
})


WE MODIFIED THIS WHEN WE ADDED RELATIONSHIP BETWEEN TASK AND USER SO NOW WE CAN ONLY GET THE TASK WE ARE SEARCHIN FOR BUT 
IT SHOULD BELONG FOR THE USER THAT HAS LOGGED IN (use authentication)       
                          \/\/\/\/\/\/\/\/\/
*/


router.get('/tasks/:id',auth, async(req, res) => {
    const _id = req.params.id
    try{
        //const task = await Task.findById(_id)
        const task = await Task.findOne({_id: _id, owner: req.user._id}) //to find a certain task we should be its owner and we should enter its id
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    }catch (e){
        res.status(500).send(e)
    }
})











//UPDATE TASKS
/*
router.patch('/tasks/:id', async(req, res) => {
    const _id = req.params.id


    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every( (update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValid){
        res.status(400).send({error: 'Invalid Update'})
    }

    try{
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        //we did not use middleware for tasks but we are just doing changes in case someone wanted to use middleware in the future
        //the 3 line of codes after this replace findByIdAndUpdate
        const task = await Task.findById(_id)

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save() //task updated

        
        
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch (e) { 
        res.status(400).send(e)
    }
})

WE MODIFIED THIS WHEN WE ADDED RELATIONSHIP BETWEEN TASK AND USER SO NOW WE CAN ONLY Update THE TASK WE ARE SEARCHIN FOR BUT 
IT SHOULD BELONG FOR THE USER THAT HAS LOGGED IN (use authentication)       
                          \/\/\/\/\/\/\/\/\/

*/

router.patch('/tasks/:id',auth, async(req, res) => {
    const _id = req.params.id


    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every( (update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValid){
        res.status(400).send({error: 'Invalid Update'})
    }

    try{
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send()
        }

        
        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save() //task updated

        res.send(task)
    }catch (e) { 
        res.status(400).send(e)
    }
})













/*
router.delete('/tasks/:id', async(req, res) => {
    const _id = req.params.id

    try{
      
        const task = await Task.findByIdAndDelete(_id)
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e) {
        res.status(500).send(e)
    }
} )


WE MODIFIED THIS WHEN WE ADDED RELATIONSHIP BETWEEN TASK AND USER SO NOW WE CAN ONLY Update THE TASK WE ARE SEARCHIN FOR BUT 
IT SHOULD BELONG FOR THE USER THAT HAS LOGGED IN (use authentication)       
                          \/\/\/\/\/\/\/\/\/


*/




router.delete('/tasks/:id',auth, async(req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOneAndDelete({_id: req.params.id,owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e) {
        res.status(500).send(e)
    }
} )







module.exports = router