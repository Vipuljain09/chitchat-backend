import app from "./app.js";
import db from "./db/index.js";
import dotenv from "dotenv";
import server from "./socket.js";

dotenv.config();

db()
  .then((data) => {
    server.listen(process.env.PORT, () => {
      console.log(`Server is listening on Port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDb connection failed", err);
  });
