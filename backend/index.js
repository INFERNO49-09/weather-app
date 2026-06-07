import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

import session from "express-session";
import connectPgSimple from "connect-pg-simple";
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
SESSION (PostgreSQL-backed)
==================================
*/

const PgStore = connectPgSimple(session);

app.use(
  session({
    store: new PgStore({
      pool,
      tableName: "session",
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

/*
==================================
PASSPORT
==================================
*/

app.use(passport.initialize());
app.use(passport.session());

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

// Only store user ID in the session cookie — lean and safe
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Re-fetch full user from DB on each request
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err);
  }
});

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
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("https://weather-app-1242.vercel.app");
  }
);

app.get("/auth/user", (req, res) => {
  if (!req.user) {
    return res.json(null);
  }
  res.json(req.user);
});

app.get("/auth/debug", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null,
    session: req.session,
  });
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy(() => {
      res.redirect("https://weather-app-1242.vercel.app");
    });
  });
});

/*
==================================
FAVORITES
==================================
*/

app.get("/favorites", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

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

app.post("/favorites", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

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

app.delete("/favorites/:city", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

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
app.use("/favorites", apiLimiter);
app.use("/weather-layer", apiLimiter);

app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

/*
==================================
LOCATION WEATHER
==================================
*/

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

/*
==================================
FORECAST
==================================
*/

app.get("/forecast/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
});

/*
==================================
AQI
==================================
*/

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

/*
==================================
WEATHER MAP LAYERS
==================================
*/

app.get("/weather-layer", async (req, res) => {
  try {
    const { layer, z, x, y } = req.query;

    const allowedLayers = [
      "clouds_new",
      "precipitation_new",
      "temp_new",
      "wind_new",
    ];

    if (!allowedLayers.includes(layer)) {
      return res.status(400).json({ error: "Invalid weather layer" });
    }

    const tileUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${process.env.API_KEY}`;
    res.redirect(tileUrl);
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