const express = require('express')
const router = express.Router();

//@route          GET api/Post  // request type to GET
//@description    Test route
//@access  Public // this will be Token route but we will not need a token 
router.get("/", (req, res) => res.send('post route'))

module.exports = router;