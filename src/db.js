import mongoose from "mongoose"


const connectDB = async() => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("connected");
}
  catch (e) {
    console.log("Connection failed: " + e)
  }
}

export default connectDB;
