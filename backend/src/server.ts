import dotenv from "dotenv";
import connectToDB from "./config/database";

dotenv.config();

connectToDB();
