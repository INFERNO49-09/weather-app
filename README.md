# 🌦️ Weather App

A modern full-stack weather dashboard built with React, Vite, Express, and OpenWeather APIs.

## Features

### Weather Data
- Current weather conditions
- 5-day forecast
- Hourly forecast visualization
- Air Quality Index (AQI)
- Geolocation-based weather
- Dynamic weather backgrounds
- Weather effects based on conditions

### User Experience
- Responsive desktop and mobile design
- Search history
- Favorite locations
- Climate insights
- Interactive weather charts
- Weather map layers
- Fast search experience

### Authentication
- Google OAuth login
- Session-based authentication
- Persistent user accounts
- User-specific favorites

### Maps
- Temperature maps
- Cloud coverage maps
- Precipitation maps
- Wind maps

---

## Tech Stack

### Frontend
- React
- Vite
- Axios
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express
- Passport.js
- Express Session
- Google OAuth 2.0

### APIs
- OpenWeather Current Weather API
- OpenWeather Forecast API
- OpenWeather Air Pollution API
- OpenWeather Map Tiles API

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## Screenshots

Add screenshots here.

```md
![Dashboard](./screenshots/dashboard.png)
![Forecast](./screenshots/forecast.png)
![Map](./screenshots/map.png)
```

---

## Project Structure

```bash
weather-app/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── index.js
│   ├── database.js
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/INFERNO49-09/weather-app.git

cd weather-app
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Environment Variables

### Backend (.env)

```env
PORT=5000

API_KEY=YOUR_OPENWEATHER_API_KEY

SESSION_SECRET=YOUR_SECRET

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

---

## Google OAuth Setup

### Authorized JavaScript Origins

```txt
http://localhost:5173
https://your-vercel-domain.vercel.app
```

### Authorized Redirect URIs

```txt
http://localhost:5000/auth/google/callback

https://your-render-backend.onrender.com/auth/google/callback
```

---

## Available API Routes

### Authentication

```http
GET /auth/google
GET /auth/google/callback
GET /auth/user
GET /auth/logout
```

### Weather

```http
GET /weather/:city
GET /weather/location
GET /forecast/:city
GET /aqi
GET /weather-layer
```

---

## Deployment

### Frontend (Vercel)

```bash
vercel
```

### Backend (Render)

1. Connect GitHub repository
2. Select backend directory
3. Add environment variables
4. Deploy

---

## Future Improvements

- PostgreSQL support
- Weather alerts
- PWA support
- Push notifications
- Dark/Light themes
- Multi-language support
- AI-powered weather insights
- Historical weather analytics

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## License

MIT License

---

## Author

**Tejash R**

GitHub: https://github.com/INFERNO49-09

Built with React, Express, and OpenWeather APIs.