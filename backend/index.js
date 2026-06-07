import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import pool, { initDB } from "./database.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

/*
==================================
RATE LIMITING
==================================
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts." },
});

app.use(express.json());

/*
==================================
CORS
==================================
*/

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://weather-app-1242.vercel.app",
    ],
    credentials: true,
  })
);

/*
==================================
PASSPORT (OAuth only — no sessions)
==================================
*/

app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://weather-app-ygbd.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || "",
          photo: profile.photos?.[0]?.value || "",
        };

        await pool.query(
          `INSERT INTO users (id, name, email, photo)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               email = EXCLUDED.email,
               photo = EXCLUDED.photo`,
          [user.id, user.name, user.email, user.photo]
        );

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// No serializeUser/deserializeUser needed — JWT handles identity

/*
==================================
JWT MIDDLEWARE
==================================
*/

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, photo: user.photo },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const token = auth.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/*
==================================
HOME
==================================
*/

app.get("/", (req, res) => {
  res.send("Backend Running");
});

/*
==================================
GOOGLE AUTH
==================================
*/

app.use("/auth/google", authLimiter);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req, res) => {
    // Issue a JWT and pass it to the frontend via URL param
    const token = generateToken(req.user);
    res.redirect(
      `https://weather-app-1242.vercel.app?token=${token}`
    );
  }
);

app.get("/auth/user", requireAuth, (req, res) => {
  res.json(req.user);
});

app.get("/auth/logout", (req, res) => {
  // JWT is stateless — logout is handled client-side by deleting the token
  res.redirect("https://weather-app-1242.vercel.app");
});

/*
==================================
FAVORITES
==================================
*/

app.get("/favorites", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT city FROM favorites WHERE user_id = $1 ORDER BY city",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load favorites" });
  }
});

app.post("/favorites", requireAuth, async (req, res) => {
  const { city } = req.body;
  try {
    await pool.query(
      "INSERT INTO favorites (user_id, city) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.user.id, city]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save favorite" });
  }
});

app.delete("/favorites/:city", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND city = $2",
      [req.user.id, req.params.city]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

/*
==================================
WEATHER
==================================
*/

app.use("/weather", apiLimiter);
app.use("/forecast", apiLimiter);
app.use("/aqi", apiLimiter);
app.use("/alerts", apiLimiter);
app.use("/favorites", apiLimiter);
app.use("/weather-layer", apiLimiter);

/*
==================================
SEVERE WEATHER ALERTS
==================================
*/

app.get("/alerts", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // OpenWeatherMap One Call API 3.0 includes official government weather alerts
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,current&appid=${process.env.API_KEY}`
    );

    res.json({ alerts: response.data.alerts || [] });
  } catch (error) {
    // One Call 3.0 requires a paid plan — return empty alerts gracefully
    // The frontend falls back to local condition-code detection
    res.json({ alerts: [] });
  }
});

app.get("/weather/:city", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${req.params.city}&appid=${process.env.API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

app.get("/weather/location", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch location weather" });
  }
});

app.get("/forecast/:city", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${req.params.city}&appid=${process.env.API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
});

app.get("/aqi", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch AQI" });
  }
});

app.get("/weather-layer", async (req, res) => {
  try {
    const { layer, z, x, y } = req.query;
    const allowedLayers = ["clouds_new", "precipitation_new", "temp_new", "wind_new"];

    if (!allowedLayers.includes(layer)) {
      return res.status(400).json({ error: "Invalid weather layer" });
    }

    res.redirect(
      `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${process.env.API_KEY}`
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load weather layer" });
  }
});

/*
==================================
SERVER
==================================
*/

const PORT = process.env.PORT || 5000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });