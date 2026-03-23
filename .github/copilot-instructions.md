Project: devTinder (backend)

High-level goal for an AI assistant
- Be productive editing and extending a small Express + Mongoose backend that implements a developer "tinder" style matching service.
- Focus on making small, safe, backwards-compatible changes: fix bugs, add endpoints, improve validation, remove secrets, and add tests or docs.

Quick facts (entrypoints & how to run)
- Entrypoint: `src/app.js` — connects DB then starts Express on port 7777.
- Start commands (from package.json):
  - `npm start` → runs `node src/app.js`
  - `npm run dev` → runs `nodemon src/app.js` (dev hot-reload)
- DB connect happens in `src/config/database.js` before the server listens.

Architecture & major components
- Express app with router files mounted at `/`:
  - `src/routes/auth.js` — signup/login/logout (cookie-based JWT)
  - `src/routes/profile.js` — profile view/edit (requires `userAuth` middleware)
  - `src/routes/request.js` — send/review connection requests
  - `src/routes/user.js` — user-facing endpoints: received requests, connections, feed (feed is stubbed)
- Auth middleware: `src/middlewares/auth.js` reads JWT from cookie `token` and looks up `User`.
- Models:
  - `src/models/user.js` — User schema, password hashing via bcrypt, methods: `getJWT()` and `validatePassword()`
  - `src/models/connectionRequest.js` — ConnectionRequest schema, index on `{fromUserId, toUserId}`, pre-save prevents self-requests
- Utilities: `src/utils/validation.js` centralises simple request validators used by routes.

Important coding patterns & conventions (project-specific)
- CommonJS modules across codebase (require/module.exports). Keep edits consistent with CommonJS.
- Routes are mounted at root, so each route file uses full paths (e.g. `/signup`, `/profile/view`).
- Cookie-based auth: login sets `res.cookie('token', token, ...)` and middleware reads `req.cookies.token`.
- JWT secret (and DB URL) are hard-coded currently in code — search `DEV@Tinder2000` and the connection string in `src/config/database.js`.
- Validation functions live in `src/utils/validation.js` and are used synchronously before DB operations.
- Error handling is simple: most routes catch and send `res.status(400).send('ERROR: ' + err.message)` or similar. Prefer preserving existing response shapes when changing behavior.

Data flows & examples (use these when adding features/tests)
- Signup: POST /signup accepts { firstName, lastName, emailId, password } → bcrypt hash → save User.
- Login: POST /login accepts { emailId, password } → validate, set cookie `token` with JWT from `user.getJWT()`.
- Protected request flow example (send connection request):
  - POST `/request/send/:status/:toUserId` uses `userAuth`, validates status ("ignored", "interested"), prevents duplicates and self-requests.
- Connection acceptance: POST `/request/review/:status/:requestId` allows `accepted` or `rejected` for requests where `toUserId` is the logged in user.
- When returning user references, code uses Mongoose `populate(..., "firstName lastName photoUrl age gender about gender")` to select fields.

Integration points & external dependencies
- MongoDB (mongoose) — connection string currently in `src/config/database.js` (contains credentials in repo). Replace with env var `MONGO_URI`.
- JSON Web Tokens (`jsonwebtoken`) — secret currently: `DEV@Tinder2000` used in `user.getJWT()` and `middlewares/auth.js`. Replace with env var `JWT_SECRET`.
- Cookie parser (`cookie-parser`) used for cookie auth.

Safety notes & immediate to-dos an AI can safely do
- Remove or stop committing secrets: move DB URI and JWT secret to environment variables and update code to read `process.env.MONGO_URI` / `process.env.JWT_SECRET`.
- When changing auth behavior, preserve cookie name `token` and existing expiry behavior to avoid breaking frontends.
- Keep response shapes consistent (string messages in some routes, JSON objects in others) unless doing a deliberate API version bump.

Files to inspect first when changing behavior
- `src/app.js`, `src/config/database.js`, `src/middlewares/auth.js`, `src/models/user.js`, `src/models/connectionRequest.js`, `src/routes/*.js`, `src/utils/validation.js`

If you need to add tests or a small harness
- No tests exist. Add a small Jest/Mocha harness and a `test` npm script if requested. Prioritize unit tests for `utils/validation.js`, `models` methods, and route-level smoke tests.

Examples (copyable snippets from this repo)
- Read auth token in middleware: `const { token } = req.cookies;` (see `src/middlewares/auth.js`)
- Generate JWT in model: `const token = jwt.sign({ _id: user._id }, "DEV@Tinder2000", { expiresIn: "7d" });` (see `src/models/user.js`)

What I couldn't discover automatically
- No test framework configured and no README explaining deployment or environment variables — follow up to confirm preferred env var names and any CI steps.

Questions for the repo owner
- Do you want me to: (A) replace hard-coded secrets with env vars now and add a sample `.env.example`, or (B) only document where to put them? Which env var names do you prefer? (I suggest `MONGO_URI` and `JWT_SECRET`.)

Please review and tell me if you want me to commit the env-var changes and a `.env.example` next.
