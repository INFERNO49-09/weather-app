import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import db from "./database.js";
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

  message: {
    error:
      "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    error:
      "Too many login attempts.",
  },
});

app.use(express.json());

/*
==================================
CORS
==================================
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/*
==================================
SESSION
==================================
*/

app.use(
  session({
    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
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
      clientID:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        "https://weather-app-ygbd.onrender.com",
    },
    (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      const user = {
        id: profile.id,
        name: profile.displayName,
        email:
          profile.emails?.[0]?.value || "",
        photo:
          profile.photos?.[0]?.value || "",
      };

      db.prepare(`
        INSERT OR REPLACE INTO users
        (id, name, email, photo)
        VALUES (?, ?, ?, ?)
      `).run(
        user.id,
        user.name,
        user.email,
        user.photo
      );

      return done(null, user);
    }
  )
);

passport.serializeUser(
  (user, done) => {
    done(null, user);
  }
);

passport.deserializeUser(
  (user, done) => {
    done(null, user);
  }
);

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
    scope: [
      "profile",
      "email",
    ],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate(
    "google",
    {
      failureRedirect: "/",
    }
  ),
  (req, res) => {
    res.redirect(
      "http://localhost:5173"
    );
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
    authenticated:
      req.isAuthenticated(),

    user: req.user || null,

    session: req.session,
  });
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({
          error:
            "Logout failed",
        });
    }

    req.session.destroy(() => {
      res.redirect(
        "http://localhost:5173"
      );
    });
  });
});

/*
==================================
FAVORITES
==================================
*/

app.get("/favorites", (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  const favorites = db
    .prepare(`
      SELECT city
      FROM favorites
      WHERE userId = ?
      ORDER BY city
    `)
    .all(req.user.id);

  res.json(favorites);
});

app.post("/favorites", (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  const { city } = req.body;

  db.prepare(`
    INSERT OR IGNORE INTO favorites
    (userId, city)
    VALUES (?, ?)
  `).run(
    req.user.id,
    city
  );

  res.json({
    success: true,
  });
});

app.delete(
  "/favorites/:city",
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    db.prepare(`
      DELETE FROM favorites
      WHERE userId = ?
      AND city = ?
    `).run(
      req.user.id,
      req.params.city
    );

    res.json({
      success: true,
    });
  }
);

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
    console.error(
      error.response?.data ||
        error.message
    );

    res.status(500).json({
      error: "Weather fetch failed",
    });
  }
});

/*
==================================
LOCATION WEATHER
==================================
*/

app.get(
  "/weather/location",
  async (req, res) => {
    try {
      const { lat, lon } =
        req.query;

      const response =
        await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=metric`
        );

      res.json(response.data);
    } catch (error) {
      console.error(
        error.response?.data ||
          error.message
      );

      res.status(500).json({
        error:
          "Failed to fetch location weather",
      });
    }
  }
);

/*
==================================
FORECAST
==================================
*/

app.get(
  "/forecast/:city",
  async (req, res) => {
    try {
      const city =
        req.params.city;

      const response =
        await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.API_KEY}&units=metric`
        );

      res.json(response.data);
    } catch (error) {
      console.error(
        error.response?.data ||
          error.message
      );

      res.status(500).json({
        error:
          "Failed to fetch forecast",
      });
    }
  }
);

/*
==================================
AQI
==================================
*/

app.get("/aqi", async (req, res) => {
  try {
    const { lat, lon } =
      req.query;

    const response =
      await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`
      );

    res.json(response.data);
  } catch (error) {
    console.error(
      error.response?.data ||
        error.message
    );

    res.status(500).json({
      error:
        "Failed to fetch AQI",
    });
  }
});

/*
==================================
WEATHER MAP LAYERS
==================================
*/

app.get(
  "/weather-layer",
  async (req, res) => {
    try {
      const {
        layer,
        z,
        x,
        y,
      } = req.query;

      const allowedLayers = [
        "clouds_new",
        "precipitation_new",
        "temp_new",
        "wind_new",
      ];

      if (
        !allowedLayers.includes(
          layer
        )
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid weather layer",
          });
      }

      const tileUrl =
        `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${process.env.API_KEY}`;

      res.redirect(tileUrl);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to load weather layer",
      });
    }
  }
);

/*
==================================
SERVER
==================================
*/

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});