const jwt = require('jsonwebtoken');
const config = require('config');


// middleware it basically it has access to  request and response cycle and objects. 
//next is like a callback that and that more to next piece of middleware 
// this is middleware function 
module.exports = function (req, res, next) {
    // we need to send the token to the header 
    // Get the token form a protected header 
    const token = req.header('x-auth-token');// x-auth-token is the key or token that we are sending in  want to send 

    //Check if not token 
    if (!token) { // if no token 
        return res.status(401).json({ msg: 'No token, authorization denied' }) // return 401 is not authorized, the status from http request 
    }

    //  Verify token 
    // basically  decoding the token 
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;// request form the user Object the token = decoded token 
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' })

    }
};

//next we go to the folder auth.js




