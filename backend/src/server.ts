import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectToDB from "./config/database";
import authorRouter from "./routes/authorRoutes";
import bookRouter from "./routes/bookRoutes";
import authRouter from "./routes/authRoutes";
import cartRouter from "./routes/cartRoutes";
import orderRouter from "./routes/orderRoutes";
import userRouter from "./routes/userRoutes";
import helmet from "helmet";

dotenv.config();

connectToDB();

const app = express();

//CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.options("*", cors()); //pre-flight handling across route (Already included in app.use(cors({...}))). This prevents "blocked by CORS policy" on complex requests that trigger pre-flight checks

//Helmet for secure headers
app.use(helmet());

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
//user routes
app.use("/api/user", userRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is now successfully running on port ${PORT}`);
});
