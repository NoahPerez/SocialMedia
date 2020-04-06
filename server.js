const express = require('express');
const connectDB = require('./config/db')

const app = express();

//Connect Database
connectDB();

// Init Middleware instead bodyParser.json to Post. We can simple use express.json // Extended: false we are passing a object of extended: false should allow us to get the req.body in user.js 
app.use(express.json());

app.get('/', (req, res) => res.send(`API Running`)); // Get method  to run API 

// access the routes //  ---- /api/users pertain so we use "require" and go thought the files 
app.use('/api/users', require('./routes/api/users')); // this will prating in the file "/'', you can see that in postman 
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/post'))



const PORT = process.env.PORT || 5000; // variable Port process in Heroku  or Locally in 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));// template literal 

