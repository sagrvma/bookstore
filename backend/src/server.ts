import dotenv from "dotenv";
import express from "express";
import connectToDB from "./config/database";
import authorRouter from "./routes/authorRoutes";

dotenv.config();

connectToDB();

const app = express();

app.use(express.json()); //Built-in middleware in Express.js that parse incoming requests with JSON payloads and makes the data available in req.body

app.use("/api/authors", authorRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is now successfully running on port ${PORT}`);
});
