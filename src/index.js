import dotenv from "dotenv";
import express from "express";
import router from "./router.js";
import connectDB from "./db.js"
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);
dotenv.config();
connectDB();

const port = process.env.PORT || 3005;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
