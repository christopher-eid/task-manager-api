const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require ('./task')




const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7, // length >= 7, length is checked after doing trim always
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password must not contain "password" ')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number')
            }
        } 
    },
    tokens: [
        {
        token: {
            type: String,
            required: true
        }
    }
    ], 
    avatar: { //to store binary data of the profile photo
            // it is not required since maybe he did not upload one
            //no need to do validation since multer already does it
        type: Buffer
    }
},{
    timestamps: true
})
//we created a schema before creating a model, in order to be able to use middleware operations and to be able to add functions to our model



//this is not a real attribute, it is not stored in the database.It is just used to set up the relationship
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})










// ----------------USE METHODS FOR INSTANCE METHODS ON SPECIFIC ROW OF COLLECTION USER

//we created the function for tokens on instance of the model User
userSchema.methods.generateAuthToken = async function () { // we did not use arrow functions
    const user = this
    //                     \/._id is an objectId so we use to string bcz the payload is a string
    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token: token}) //we added an object containing the token to the user
    await user.save()                               //we save the token to the database

    return token



}



/*we used getPublicProfile in login route in user router to control what is sent back to the user*/
/*then we changed its name to toJSON so now it will work with all routes*/
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject() /*we converted our row from the database to an object*/

    delete userObject.password
    delete userObject.tokens /*we removed attributes that we wanted to remove from the return*/
    delete userObject.avatar //bcz images take a lot of space so it will slow response when user is returned
    return userObject
}

















//USE STATICS FOR STATIC METHODS FOR any ROW IN THE USER COLLECTION

//we are adding a functio to statics of the schema, so now we can access the function from the model when we create it
userSchema.statics.findByCredentials = async(email, password) => {

    const user = await User.findOne({email: email})

    if(!user){
        throw new Error('Unable to login')
    }
    //if we found a user with the entered email, we should check if password is compatible with hashed password
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    //both email and password are compatible
    return user
}





//middleware lets us do things before or after events like save for example
//here we hashed the password before saving
userSchema.pre('save',async function (next) { //here we did not use arrow functions
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    console.log('just before saving')

    next() //DO NOT FORGET TO CALL NEXT SO THE EVENT IS EXECUTED
})



//Middle for deleting the tasks related to a user when a user is removed

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})







//mongoose will take the name \/ 'User', puts it in minuscule and plural and it will be the table name
const User = mongoose.model('User', userSchema)


// const me = new User({
//     name: '           Andrew',
//     email: 'MYEMAIL@MEAD.IO    ',
//     password: 'phone098!'
// })

// me.save().then( (me) => {
//     console.log(me)
// }).catch( (error) => {
//     console.log(error.errors)
// })

module.exports = User