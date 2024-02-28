const passport = require("passport");
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("morgan");



const express = require("express");
const app = express();
//New imports
const http = require('http').Server(app);
//Pass the Express app into the HTTP module.
const socketIO = require('socket.io')(http);

const socketServer = require("./socketServer");

app.use(logger("dev"));
require("dotenv").config();



app.use(cors()); // Add cors middleware
require("./middleware/passport")(passport);


const PORT = process.env.Port || 8080;
const DBurl = process.env.MongoUri;


const path = require("path");
const { isHttpError } = require("http-errors");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/public/', express.static(path.join(__dirname, 'public')));
// app.use('/public-api', require("./routes/PublicRoute"));

app.use("/user", require("./routes/userRoute"));

app.use((error, req, res, next) => {
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;
    console.error("for unknown error", error);
    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }
    res.status(statusCode).json({ error: errorMessage });
});

app.all("*", (req, res) => {
    res.status(404).json({ error: "404 Not Found" });
});

socketServer(socketIO);

startApp = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(DBurl);
        console.log("Connected to the Database successfully");
        http.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.log(`Unable to connect with the database: ${err.message}`);
        startApp();
    }
};

startApp();


