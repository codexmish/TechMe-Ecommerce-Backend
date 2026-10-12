# TechMe E-commerce Backend

Backend for TechMe, a single-vendor online store where customers can browse products, add to cart, apply coupons, place orders and pay online or with cash on delivery.

> **Status:** in progress. Step 1 (project setup) is done.

## Team

| Developer | Modules |
| --- | --- |
| Shanto | Project setup, emails & scheduled tasks, store settings, products & variants, listing/search/filters, checkout & orders, payments |
| Jakariya | Authentication, categories, users/roles/addresses, cart & wishlist, coupons, reviews & ratings, admin dashboard |

## Tech stack

Node.js, Express 5, MongoDB with Mongoose, Zod for validation, JWT for auth.

## Getting started

### Requirements

- Node.js **20.19 or newer**
- A MongoDB database. Use **MongoDB Atlas** (or another replica set), because checkout uses transactions, which a standalone local MongoDB does not support.

### Setup

```bash
git clone https://github.com/codexmish/TechMe-Ecommerce-Backend.git
cd TechMe-Ecommerce-Backend
npm install
```

Create your `.env` from the example file and fill in the values:

```bash
cp .env.example .env
```

(On Windows Command Prompt use `copy .env.example .env`.)

Start the server:

```bash
npm run dev
```

Check that it works: open <http://localhost:8000/api/v1/health>. You should see `"database": "connected"`.

## Environment variables

The server checks `.env` when it starts. If a required value is missing or wrong, it prints which one and stops.

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development`, `production` or `test` |
| `PORT` | No | Server port, default `8000` |
| `BASE_URL` | Yes | API prefix, e.g. `/api/v1` |
| `CLIENT_URL` | Yes | Frontend URL allowed by CORS, e.g. `http://localhost:3000` |
| `DATABASE_URL` | Yes | MongoDB connection string (starts with `mongodb`) |
| `BCRYPT_SALT_ROUNDS` | Yes | Password hashing rounds, minimum `8` |
| `JWT_ACCESS_SECRET` | Yes | At least 32 characters |
| `JWT_REFRESH_SECRET` | Yes | At least 32 characters |
| `JWT_ACCESS_EXPIRES_IN` | Yes | e.g. `15m`, `1d` |
| `JWT_REFRESH_EXPIRES_IN` | Yes | e.g. `7d` |
| `SMTP_USER`, `SMTP_PASS` | Not yet | Email sending |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Not yet | Product image upload |
| `REDIS_USER`, `REDIS_PASS`, `REDIS_HOST`, `REDIS_PORT` | Not yet | Redis |

"Not yet" variables become required when their feature is built (see `src/app/configs/envConfig/index.js`).

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the server and restart on file changes (use this while coding) |
| `npm start` | Start the server without watching (used in production) |
| `npm run format:fix` | Format all files in `src` with Biome |

## Folder structure

```
src/
├── server.js                 # connects the database, starts the server, graceful shutdown
├── app.js                    # express app: middlewares, routes, 404, error handler
└── app/
    ├── configs/
    │   ├── dbConfig/         # MongoDB connection
    │   └── envConfig/        # reads and checks .env
    ├── middleWares/          # notFound, requestLogger, zodValidation
    ├── modules/              # one folder per feature (auth, product, order ...)
    │   └── <module>/
    │       ├── <module>.routes.js
    │       ├── <module>.controller.js
    │       ├── <module>.services.js
    │       ├── <module>.validation.js
    │       └── <module>.model.js
    ├── routes/index.js       # all module routes are added here
    └── utils/                # SendResponse, AppError, globalErrorHandaler, rateLimit, catchAsync
```

## Team rules

**1. Send every response with `SendResponse`**, so all responses have the same shape:

```js
new SendResponse(res, {
	statusCode: httpStatus.OK,
	message: "Product found",
	data: product,
	meta, // optional, for pagination
});
```

```json
{ "success": true, "statusCode": 200, "message": "Product found", "data": { } }
```

**2. Throw `AppError` for errors.** The global error handler sends the response:

```js
throw new AppError(httpStatus.NOT_FOUND, "Product not found");
```

```json
{ "success": false, "statusCode": 404, "message": "Product not found" }
```

Mongoose errors (validation, invalid id, duplicate key) and Zod errors are handled automatically. They return `400` / `409` with a list of field errors:

```json
{ "success": false, "statusCode": 400, "message": "Validation failed", "error": [{ "field": "price", "message": "..." }] }
```

**3. Validate input with `zodValidation`:**

```js
router.post("/", zodValidation(createProductSchema), controller);           // req.body
router.get("/", zodValidation(productQuerySchema, "query"), controller);    // req.validatedQuery
router.get("/:id", zodValidation(idParamsSchema, "params"), controller);    // req.params
```

For `query`, read the checked data from **`req.validatedQuery`**, not `req.query` (Express 5 does not allow changing `req.query`).

**4. Add module routes in `src/app/routes/index.js`.** They are served under `/api/v1`:

```js
router.use("/products", productRoutes); // -> /api/v1/products
```

**5. Always write `.js` at the end of local imports.** This project uses ES modules:

```js
import { AppError } from "../../utils/appError.js"; // not "../../utils/appError"
```

**6. Run `npm run format:fix` before every commit.**

## API endpoints

All endpoints start with `/api/v1`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | Server and database status |

More endpoints will be added here as each module is finished.
