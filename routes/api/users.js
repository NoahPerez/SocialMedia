const express = require("express");
const router = express.Router();
const gravatar = require("gravatar"); // need to install npm i gravatar
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken'); // need to install npm i jsonwebtoken 
const config = require('config');
const { check, validationResult } = require("express-validator"); // need to install express-validator


// we need to bring the user models// ../../up to levels into models/User folder.// this is connected to the logical part 
const User = require('../../models/User')

//@route          Post api/users  // request type to Post // test in Post Man
//@description    Register User
//@access  Public // this will be Token route but we will not need a token
router.post(
    "/",
    [
        // this set all the validation 
        // check name, and we can pass in a second parameter  a custom error message // we need .not().isEmpty
        // isEmail check if it is a valid formated email.
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 })
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
        const { name, email, password } = req.body;

        try {
            // See if the user exists // findOne takes if you want to example: username or whatever
            let user = await User.findOne({ email })

            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] }); // if the user already exits 
            }

            //this is an instate of a user // Get user gravatar
            // pass in the email of the user and options 
            // s is default size: string //r rating 
            // d default image like a user icon
            //  @ line 59 create an instant of a user that we are passing as an object// we grab the user variable line 44
            const avatar = gravatar.url(email, {
                s: "200",
                r: "pg",
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });

            // Encrypt password before saving the user of the instant line 58
            // a variable salt so we can get promise from Bcrypt dot Jen salt
            // we will pass in 10 that is rounds, it is recommended in the documentation the more you have more secure but slower it gets 
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();// this is saving the user.

            // Return jsonwebtoken // Using jsonToken in order the user to login right away if you have the Token.
            // Our payload is going to be an object // User will have an id to get that user.id 
            // in mongoDB they use an _id but in mongoose they use an abstraction .id
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
                { expiresIn: 360000 },
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
