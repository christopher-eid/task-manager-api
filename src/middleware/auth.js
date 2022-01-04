const jwt = require('jsonwebtoken')
const User = require('../models/user')
const auth = async(req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '') //take
        const decoded = jwt.verify(token, process.env.JWT_SECRET)  //to check if the token is valid, we get back the user id of this token from the payload
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token}) //we check if there is a user with that id and it should also have this token existing in its list of tokens

        if(!user) {
            throw new Error()
        }
        req.token = token  //we created token and user attributes that will be on the request an used on the route after the middleware
        req.user = user
        next()
    }catch (e){
        res.status(401).send({error: 'Please authenticate'})
    }
}

module.exports = auth