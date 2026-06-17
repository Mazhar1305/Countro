import mongoose from "mongoose";
import config from "./config.js";

async function ConnectDb() {
  try {
    const connectionInstance = await mongoose.connect(config.MONGO_URI)
 
    console.log(`\n MongoDB connected ! DB host: ${connectionInstance.connection.host}`);
   
   } catch (error) {
     console.log('Error connecting DataBase',error);
     process.exit(1)
   }
}

export default ConnectDb