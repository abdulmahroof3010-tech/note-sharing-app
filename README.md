# Note Sharing App

A full-stack note sharing application. Authenticated users can create notes and share them with public or password-protected links that are either one-time or time-based.

## Setup

### Prerequisites

- Node.js 18 or newer
- MongoDB, local or hosted

### Install

```bash
cd server
npm install

cd ../client
npm install
```

Create `server/.env`: 

```env
PORT=5001
MONGODB_URL=mongodb://127.0.0.1:27017/note-sharing
TOKENKEY=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
```

Start the API and frontend in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:3000` and the API at `http://localhost:5001`.

For a production build:

```bash
cd client
npm run build
npm start
```

The server uses `npm start` for its production process.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Axios
- **Backend:** Node.js, Hono, `@hono/node-server`
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT stored in an HTTP-only cookie
- **Password/key hashing:** bcryptjs with cost factor 12
- **Randomness:** Node.js `crypto.randomBytes` and `crypto.randomInt`

## Database Schema

### `User`

The user model stores:

| Field | Type | Description |
| --- | --- | --- |
| `name` | String | Display name, required |
| `email` | String | Login email, required |
| `password` | String | bcrypt password hash; excluded from normal queries |

### `Notes`

| Field | Type | Description |
| --- | --- | --- |
| `userId` | ObjectId | Owner, required |
| `title` | String | Note title, required |
| `content` | String | Note body, required |
| `shareToken` | String | Unique public token |
| `shareType` | `one-time` or `time-based` | Link lifetime policy |
| `accessType` | `public` or `password-protected` | Access policy |
| `passwordHash` | String | bcrypt hash of the generated access key |
| `expiresAt` | Date | Required by the time-based flow |
| `used` | Boolean | Whether a one-time link has been consumed |
| `revoked` | Boolean | Whether the owner disabled the link |
| `viewCount` | Number | Successful share views; starts at `0` |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

## Share Link Flow

1. An authenticated user submits a title, content, `shareType`, `accessType`, and, for a time-based link, a future `expiresAt`.
2. The server creates a 32-byte random token and stores its hexadecimal representation in `shareToken`.
3. For a password-protected link, the server generates and returns a six-character key, then stores only its bcrypt hash.
4. The server returns a URL such as `/share/<token>`.
5. A public link is read with `GET /api/share/:token`.
6. A password-protected link first requires `POST /api/share/:token/unlock` with `{ "accessKey": "..." }`.
7. A successful read returns the note title and content and increments `viewCount`.

## Password and Key Generation

Access keys are generated with `crypto.randomInt` from `ABCDEFGH12345`, producing six characters. The plaintext key is returned only when the share is created. The database stores `bcrypt.hash(accessKey, 12)`, and unlock attempts are checked with `bcrypt.compare`.

The share token is independent of the access key and contains 256 bits of randomness, making token guessing impractical when rate limiting and HTTPS are correctly configured.

## Expiry and Revocation

- **One-time:** The first successful access marks `used` as `true`; later attempts receive `410 Gone`.
- **Time-based:** Access is rejected with `410 Gone` when `expiresAt <= new Date()`.
- **Revoked:** The owner can call `PATCH /api/notes/:id/revoke`. Revoked links are rejected with `403 Forbidden`.
- A link can be both time-based and password-protected; all applicable checks are performed.

## View Count and Race-Condition Handling

View counts are updated in MongoDB with an atomic `$inc` operation. The one-time path uses a compare-and-set style filter:

```js
{ shareToken, used: false, revoked: false }
```

and updates `used: true` and `$inc: { viewCount: 1 }` in the same `findOneAndUpdate` operation. MongoDB allows only one concurrent request to match `used: false`, so two simultaneous users cannot both consume the same one-time link. The request whose update finds no document receives `410 Gone`.

## Production Considerations

### Preventing simultaneous use of a one-time link

Use the atomic conditional update described above, with a unique index on `shareToken`. Do not perform a separate `find` followed by `save`, because that creates a check-then-update race.

### Safely updating view count

Use MongoDB's atomic `$inc`, not read-modify-write application logic. For higher traffic, view events can be buffered through a durable queue and aggregated, but the one-time consumption decision must remain an atomic database operation.

### Supporting 1 million link opens

The current app is a small single-process implementation. At million-request scale, place multiple stateless API instances behind a load balancer, use a managed MongoDB replica set with appropriate indexes and connection pooling, and put caching/CDN in front of immutable public reads where the product policy allows it. Keep one-time consumption strongly consistent and route it to the primary database. Add observability, timeouts, queue-based analytics, and abuse protection. A cache must never be allowed to serve a one-time link after it has been consumed or a link has been revoked.

### Preventing brute-force attempts

The password-protected share unlock endpoint is protected with a rate
limiter. A client is allowed a limited number of unlock attempts within
a fixed time window. Requests exceeding the limit receive HTTP 429
(Too Many Requests).

The POC uses an in-memory rate-limit store. For a multi-instance
production deployment, this should be moved to a shared store such as
Redis so all API instances enforce the same limit.

## API Summary

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create an account |
| `POST` | `/api/auth/login` | No | Log in and set the JWT cookie |
| `GET` | `/api/notes` | Yes | List the current user's notes |
| `POST` | `/api/notes/new` | Yes | Create a note and share link |
| `GET` | `/api/notes/:id` | Yes | Get an owned note |
| `PATCH` | `/api/notes/:id/revoke` | Yes | Revoke a share link |
| `GET` | `/api/share/:token` | No | Read a public share link |
| `POST` | `/api/share/:token/unlock` | No | Unlock a password-protected link |

## Security Notes

Set a strong `TOKENKEY` and use HTTPS in production. Configure the CORS origin and cookie settings for the deployed frontend and backend. Do not log access keys or return them again after note creation.
