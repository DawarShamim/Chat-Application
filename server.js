const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http');
const { socketServer } = require("./socketServer");

require("dotenv").config();

const socketIO = require('socket.io');

const PORT = process.env.Port || 8080;
const passport = require("passport");

app.use(cors()); // Add cors middleware
require("./middleware/passport")(passport);


const server = http.createServer(app);
const io = socketIO(server);


const path = require("path");
const { isHttpError } = require("http-errors");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/public/', express.static(path.join(__dirname, 'public')));
// app.use('/public-api', require("./routes/PublicRoute"));

app.use("/api/user", require("./routes/userRoute"));



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

socketServer(io);

startApp = async () => {
    try {
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.log(`Error Occured: ${err.message}`);
        startApp();
    }
};

startApp();


