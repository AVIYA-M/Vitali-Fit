# VitaliFit

VitaliFit is a fitness and wellness web application with a static client and an
Express 5 API backed by MongoDB/Mongoose.

## Run locally

1. Install Node.js (the server uses ES modules and Express 5).
2. Copy `.env.example` to `server/.env` and set `MONGO_URI`, `JWT_SECRET`, and
   `CLIENT_URL` to values for your environment. `GEMINI_API_KEY` is optional
   unless you want to analyze meal images.
3. Set the API host once in `client/shared/config.js` before deploying the
   client. It defaults to `http://localhost:5000`.
4. Start the API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

5. Serve the `client` directory with a local static web server whose origin
   matches `CLIENT_URL`. The API health endpoint is
   `http://localhost:5000/api/status`.

See [server/README.md](./server/README.md) for API routes, environment
configuration, and deployment details. Never commit `.env` files, credentials,
uploads, or production logs.
