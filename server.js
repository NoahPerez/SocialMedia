const express = require('express');

const app = express();

app.get('/', (req, res) => res.send(`ÀPI Running`));

const PORT = process.env.PORT || 5000; // variable Port process in Heroku  or Locally in 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));// template literal 

