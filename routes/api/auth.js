const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require('../../middleware/auth'); // we brought in our middleware 
const jwt = require('jsonwebtoken'); // need to install npm i jsonwebtoken 
const config = require('config');
const { check, validationResult } = require("express-validator"); // need to install express-validator

const User = require('../../models/User'); // we brought by models User.js

//@route          GET api/Authorization   // request type to GET
//@description    Test route
//@access  Public // this will be Token route but we will not need a token 

// any time we want to use our middleware auth. It going to make it protected 
router.get("/", auth, async (req, res) => { // get to authorize token middleware
    try {
        const user = await User.findById(req.user.id).select('-password') //Since it is protected router and we use the Token that has the id
        // requesting the user id but we don't want the -password.
        res.json(user);// send the user 
    } catch (err) {
        console.error(err.massage);
        res.status(500).send('Server Error') // if a go to post man i as a get method, i would get my user data
    }
});

//@route          Post api/auth 
//@description    Authenticate user and get Token 
//@access  Public // this will be Token route 
router.post(
    "/",
    [
        // this set all the validation 
        // isEmail check if it is a valid formated email.
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    // this set the response 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // If not error. put parenthesis this is Function isEmpty
            return res.status(400).json({ errors: errors.array() }); // we want to send a response, but we want to send 400 that is bad Request.If the user don't send correctly they information it a bad request.
        }    //.json to make it visible in the response // there is method array to send that back
        // If any of the user Information don't match we should get line 24

        //--------------------------Logical Part----------------------------------//
        // Deconstruct // to pull this information 
        const { email, password } = req.body;

        try {
            // See if the user exists // findOne takes from the database in this case email
            let user = await User.findOne({ email })

            if (!user) { // we want to check it their is not a user, if not we send back an error 
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // we need to match the email and password //
            // password is line 52 that is the plain text form the user
            //user.password it is the encrypted, from line 56 FindOne

            const isMatch = await bcrypt.compare(password, user.password);// comparing if both passwords are true

            if (!isMatch) {  //if i make a post in postman i would get token 
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // Return jsonwebtoken // Using jsonToken in order the user to login right away if you have the Token.
            // Our payload is going to be an object // User will have an id to get that user.id 
            // in mongoDB they use an _id but in mongoose they use an abstraction .id
            // We have the id we send it to payload
            const payload = {
                user: {
                    id: user.id
                }
            };
            // We will get a token 
            // this is in line 6 and in folder config 
            // the token has an expires 
            // Call back function if it throw an error 
            jwt.sign(
                payload, // pass the payload
                config.get('jwtSecret'),// pass in the secret jwtSecret. That is in folder config/default
                { expiresIn: 3600 },
                (err, token) => {   // it takes a possible error or token 
                    if (err) throw err; // if error throw and error
                    res.json({ token }); // if not send a 200 response (back to the client) but the data that we want is the token 
                }
            );

        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error');

        }
    }
);

//this is finish after that need to make you own Middleware folder.
// what we need to do now is make it so we can send that token back to authenticate an access protected 

module.exports = router;