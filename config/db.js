const mongoose = require('mongoose'); // this is what we are using to connect 
const config = require('config'); // for global variables // to bring the string from MongoURI
const db = config.get('mongoURI');// to get any of the values of that json file 


const connectDB = async () => {
    try {
        await mongoose.connect(db, { // need to connect to database
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};


module.exports = connectDB