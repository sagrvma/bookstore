import dotenv from "dotenv";
import express from "express";
import connectToDB from "./config/database";
import authorRouter from "./routes/authorRoutes";
import bookRouter from "./routes/bookRoutes";
import authRouter from "./routes/authRoutes";
import cartRouter from "./routes/cartRoutes";
import orderRouter from "./routes/orderRoutes";

dotenv.config();

connectToDB();

const app = express();

app.use(express.json()); //Built-in middleware in Express.js that parse incoming requests with JSON payloads and makes the data available in req.body

//Author routes
app.use("/api/authors", authorRouter);
//Book routes
app.use("/api/books", bookRouter);
//auth routes
app.use("/api/auth", authRouter);
//cart routes
app.use("/api/cart", cartRouter);
//order routes
app.use("/api/orders", orderRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is now successfully running on port ${PORT}`);
});
