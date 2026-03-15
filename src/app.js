const express = require('express');

const app = express();

app.use("/test",(req,res) => {
    res.send("Hello from the server");
}); //function is known as the request handler 

app.listen(7777, () => {
    console.log("Server is listening on port 7777");
});