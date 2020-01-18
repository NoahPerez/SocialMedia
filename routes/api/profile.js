const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile') // bring in the models
const User = require('../../models/User') // bring in the models

//@route          GET api/profile/me  // request type to GET.Get api/profile to get all profiles. api/profile/me to get my profile
//@description    Get current users profile
//@access         Private // if it private we need the token, we need to bring in middleware. We are getting token form the user profile.So we need to bring the middleware

// we are using async because  Mongoose here which returns a promise 
router.get("/me", auth, async (req, res) => {
    try {                                                            // userProfile it is pertaining to the Profile.js that will be the objectId of the userProfile. So we are going to set that to the user I.D that comes in when the token 
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);// We take the Profile Model findOne because we are trying to find one we want to find it by user remember request dot user we want to get it by id.
        if (!profile) {                                                                                          // We want to populate the name of the user and the avatar
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile); // if there is a profile we will send along the profile
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

//@route    POST api/profile
//@desc     create or update user profile
//@access   Private 

// we need to use  2 middleware the auth and validation. so we need to use [] brackets.
router.post
    ('/',
        [
            auth,
            [
                check('status', 'status is required')
                    .not()
                    .isEmpty(),
                check('skills', 'skills is required')
                    .not()
                    .isEmpty()
            ]
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {  // if there are errors 
                return res.status(400).json({ errors: errors.array() }) // return json of object to an array 
            }

            const {  // we are pull all this stuff form request.body
                company,
                website,
                location,
                bio,
                status,
                githubusername,
                skills,
                youtube,
                facebook,
                twitter,
                instagram,
                linkedin
            } = req.body;

            //Build profile object 
            const profileFields = {}; // initialize it to an empty object 
            profileFields.user = req.user.id;// it will already know that by the token that is was sent 
            if (company) profileFields.company = company;
            if (website) profileFields.website = website;
            if (location) profileFields.location = location;
            if (bio) profileFields.bio = bio;
            if (status) profileFields.status = status;                                  // it convert the object(the skills written by the user) into an array trim
            if (githubusername) profileFields.githubusername = githubusername;         //map though the array(creates an array) and chain it onto trim
            if (skills) {                                                             // Trim it take out the spaces. For each skill we will trim it. 
                profileFields.skills = skills.split(',').map(skill => skill.trim()); // split witch turn a string into an array takes in deliminator that is a comma (,)
            }

            //Build social object 
            profileFields.social = {} // it should be initialize  as an empty object 
            if (youtube) profileFields.social.youtube = youtube;
            if (twitter) profileFields.social.twitter = twitter;
            if (facebook) profileFields.social.facebook = facebook;
            if (linkedin) profileFields.social.linkedin = linkedin;
            if (instagram) profileFields.social.instagram = instagram;

            try {


                let profile = await Profile.findOne({ user: req.user.id });// requesting the id of user form the models profile

                if (profile) {
                    //update
                    profile = await Profile.findOneAndUpdate(
                        { user: req.user.id },// requiting from user  the id in models profile
                        { $set: profileFields }, // setting the profiles fields above 
                        { new: true }
                    );
                    return res.json(profile);
                }
                // Create 
                profile = new Profile(profileFields) // passing our New Profile, profileFields 
                await profile.save(); // saving 
                res.json(profile); // returning the profile 
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
            }
        }
    );

//@route    GET api/profile
//@desc     GET all profiles
//@access   Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    GET api/profile/user/:user_id // :user_id it`s a place holder 
//@desc     GET profile by user ID
//@access   Public

router.get('/user/:user_id', async (req, res) => {
    try {                                        //We want to find one User and the Id will come form the URL /user/:user_id. 
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({ msg: 'Profile not found' }); //if not profile return 400 status
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'Object') {
            return res.status(400).json({ msg: 'Profile not found' });
        }// if there is a certain kind of err
        res.status(500).send('Server Error'); // it not passing a valid object Id 
    }
});

//@route    Delete api/profile/
//@desc     Delete profile, user & post 
//@access   Private

router.delete('/', auth, async (req, res) => {
    try {
        //@todo - remove users posts 

        //Remove profile 
        await Profile.findOneAndRemove({ user: req.user.id });

        // Remove user
        await Profile.findOneAndRemove({ _id: req.user.id });


        res.json({ msg: 'User Delete' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    Put (updating) api/profile/experience
//@desc     add profile, experience
//@access   Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From data is required').not().isEmpty()

]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });// once we have that
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body; //getting the body data

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            //experience which it going to be and array  we can use push
            //unshift is like push but it pushes onto the beginning rather than the end
            // that way the more recent is first and we're gonna just throw in here new experience which ir our object
            profile.experience.unshift(newExp);// witch is the new object we created on top  // unshift push at the begging not the end of the array  

            // here we will save the newExperience 
            await profile.save();


            // our response // this will return the whole profile 
            res.json(profile);
        } catch (err) {
            console.error(err.massage);
            res.status(500).send('Server Error');
        }

    }
);


//@route    Delete api/profile/experience/:exp_id
//@desc     Delete experience from profile
//@access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {

        // getting the profile of the user the logged in user 
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        // we use splice because we want to remove from index 
        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile)
    } catch (err) {
        console.error(err.massage);
        res.status(500).send('Server Error');
    }
});


//@route    Put (updating) api/profile/experience
//@desc     add profile, experience
//@access   Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From data is required').not().isEmpty()

]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });// once we have that
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body; //getting the body data

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            //experience which it going to be and array  we can use push
            //unshift is like push but it pushes onto the beginning rather than the end
            // that way the more recent is first and we're gonna just throw in here new experience which ir our object
            profile.experience.unshift(newExp);// witch is the new object we created on top  // unshift push at the begging not the end of the array  

            // here we will save the newExperience 
            await profile.save();


            // our response // this will return the whole profile 
            res.json(profile);
        } catch (err) {
            console.error(err.massage);
            res.status(500).send('Server Error');
        }

    }
);


//@route    Delete api/profile/experience/:exp_id
//@desc     Delete experience from profile
//@access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {

        // getting the profile of the user the logged in user 
        const profile = await Profile.findOne({ user: req.user.id });

        // Get remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        // we use splice because we want to remove from index 
        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile)
    } catch (err) {
        console.error(err.massage);
        res.status(500).send('Server Error');
    }
});


module.exports = router;