const express = require('express');
const cors = require('cors');
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const http = require("http");


require("dotenv").config();
require("./utils/cronjob");

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const initializeSocket = require('./utils/socket');
const chatRouter = require('./routes/chat');


const server = http.createServer(app);
initializeSocket(server);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

connectDB()
    .then(() => {
        console.log("Database connection established...");
        server.listen(process.env.PORT, () => {
            console.log("Server is listening on port 7777");
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected",err);
    });
    