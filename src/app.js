import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRoute from "./routes/user.routes.js";
import MessageRoute from "./routes/message.routes.js";
const app = express();
app.use(cors());

app.use(express.urlencoded({ extended: true, limit: "16kb" })); // required to config the url data.
app.use(express.static("public")); // require to interact with static data that we store in server itself.
app.use(express.json());

app.use(cookieParser());

// adding the routes here

app.use("/api/v1/user", UserRoute);
app.use("/api/v1/message", MessageRoute);

export default app;
