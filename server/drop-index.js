import mongoose from "mongoose";
import 'dotenv/config'

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const db = mongoose.connection.db;
    const indexes = await db.collection("users").indexes();
    console.log("Current indexes on users collection:");
    console.log(indexes);
    
    // Explicitly try to drop it again
    try {
        await db.collection("users").dropIndex("email_1");
        console.log("Successfully dropped 'email_1' index!");
    } catch(e) { console.log(e.message); }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Connection error:", err);
  }
}

checkIndexes();
