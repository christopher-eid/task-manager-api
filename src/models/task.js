const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required:true,
        ref: 'User' //to create the relationship with the User model
    }
},{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema )


module.exports = Task

/*
const myTask = new Task({
    description: 'Learn Mongoose                 ',
    
})

myTask.save().then( (myTask) => {
    console.log(myTask)
}).catch( (error)=> {
    console.log(error)
})*/