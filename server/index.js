import express from "express";
import mongoose  from "mongoose";
import cors from "cors";
import todoRoutes from "./routes/todoRoutes.js";
import * as dotenv from 'dotenv';
// Load environment variables from the .env file
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.get('/', (req, res) => {
  res.send('TodoList API');
})
//db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
});

// API routes
app.use("/api/v1/todo", todoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
