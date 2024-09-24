import mongoose from "mongoose";
import {DB_NAME} from "../utils/constant.js";

const db = async () => {
  try {
    const connection = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@learn-backend.vhlewdg.mongodb.net/${DB_NAME}`
    );
    console.log("Mongodb connect successfully");
    return connection;
  } catch (error) {
    console.log(error);
  }
};
export default db;
