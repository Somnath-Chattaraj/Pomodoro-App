import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import statsRoutes from "./routes/statsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import deleteTemp from "./deleteTemp/delete.js";
import passport from "passport";
import session from "express-session";
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with the URL of your React app
    credentials: true, // Enable credentials (cookies)
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to false since frontend is served over HTTP
      maxAge: 365 * 24 * 60 * 60 * 1000, // Expires in 1 year
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/stats", statsRoutes);
app.use("/api/user", userRoutes);
app.use("/auth/google", googleRoutes);
app.use("/deletetemp", deleteTemp);
app.get("/", (req, res) => {
  res.send("Backend is Live ");
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
