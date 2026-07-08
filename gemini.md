# AI Coding Instructions (gemini.md)

Welcome, AI coding assistant! This file provides instructions, style guides, and coding patterns specific to the **Express-Prisma-Stripe-Zod-Boilerplate** codebase. Always refer to this guide when writing code or creating features in this workspace.

---

## 🛠️ Stack & Conventions

- **Runtime & Language**: Node.js, TypeScript (ES2023, ESM resolution).
- **Web Server**: Express.js (v5.x).
- **ORM & DB**: Prisma (PostgreSQL database via `@prisma/adapter-pg` driver adapter).
- **Request Validation**: Zod (v4.x).
- **Security & Logging**: Helmet, Express Rate Limit, Morgan.

---

## 📂 Architecture Guide

We follow a **Modular Design** pattern. Do not create general global folders for routes, controllers, or services. Group features as modules under `src/modules/<module-name>/`:

- `<module-name>.interface.ts` (TypeScript interfaces and payload types)
- `<module-name>.validation.ts` (Zod payload validation schemas)
- `<module-name>.service.ts` (Database interactions and core business logic)
- `<module-name>.controller.ts` (Request/response handlers, cookies, response formats)
- `<module-name>.route.ts` (Express routing rules, rate limiters, validation hooks, auth guards)

---

## ⚠️ Critical Coding Patterns

### 1. Zod v4 validation rules (Strict)

This project uses **Zod v4**. The syntax for custom error messages has changed.

- **Do NOT** use Zod v3 deprecated keywords: `required_error`, `invalid_type_error`, or `message`.
- **Do NOT** use chain validations on `z.string()` for formats. Use top-level format functions instead.
  - ❌ `z.string().email("Invalid format")`
  - ❌ `z.string().url({ message: "Invalid URL" })`
  - ✅ `z.email({ error: "Invalid format" })`
  - ✅ `z.url({ error: "Invalid URL" })`
- **Unified Error Option**: Use the `error` property to define simple custom error messages, or pass a function mapping:

  ```typescript
  // Simple String Error:
  name: z.string().min(1, { error: "Name cannot be empty" });

  // Dynamic validation message (e.g. differentiating missing vs invalid format):
  email: z.email({
    error: (issue) =>
      issue.input === undefined || issue.input === ""
        ? "Email is required"
        : "Invalid email format",
  });
  ```

### 2. Prisma Pg Adapter Requirement

Because we use `@prisma/adapter-pg` to enable PostgreSQL connection pooling under ESM, **do not** instantiate `new PrismaClient()` without its adapter.

- Always import and pass the `PrismaPg` adapter:

  ```typescript
  import { PrismaPg } from "@prisma/adapter-pg";
  import { PrismaClient } from "path/to/generated/client";

  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  ```

### 3. Controller Error Delegation

Every controller method **must** be wrapped using the `catchAsync` utility. Do not write manual `try-catch` blocks inside controllers. Let the errors bubble up to the global error controller.

```typescript
import { catchAsync } from "../../utils/catchAsync";

const registerUser = catchAsync(async (req, res, next) => {
  // your logic...
  sendResponse(res, { ... });
});
```

### 4. JWT Access & Route Guarding

- The `auth` middleware accepts list of authorized `Role` enums.
- The authenticated user's details are attached to the express request object as `req.user`.
- Typing for `req.user` is globally declared inside `src/middlewares/auth.ts`.

```typescript
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

// Route guard usage:
router.get("/me", auth(Role.Admin, Role.User), UserController.getMyProfile);
```

### 5. Standard API Response

Always format HTTP responses using `sendResponse` from `src/utils/sendResponse`:

```typescript
sendResponse(res, {
  success: true,
  status_code: httpStatus.OK,
  message: "Resource fetched successfully",
  data: result,
});
```

---

## 🚀 Deployment & Serverless (Vercel) Guidelines

### 1. ESM Suffix Requirement
Because this project utilizes strict ES Modules (ESM) resolution:
* **All relative imports** inside `src/` (e.g. imports of other `.ts` files or local modules) **must specify the `.js` extension** (e.g., `import app from "./app.js"`).
* Directory imports (e.g., `import config from "./config"`) are not supported under Node's native ESM engine. Use `import config from "./config/index.js"` instead.

### 2. Standard Prisma Generator Output
* **Never configure a custom output path** for the generator client in `schema.prisma` (e.g. `output = "../generated/prisma"`).
* Prisma's internally generated files contain extensionless imports which throw `ERR_MODULE_NOT_FOUND` in production under ESM.
* Keep the default generator path (`node_modules/@prisma/client`) and import all clients, enums, and types directly from `@prisma/client`.

### 3. Cookies Secure Flag in Development
* When setting session cookies (e.g. `refreshToken`), dynamically toggle the `secure` option:
  ```typescript
  secure: process.env.NODE_ENV === "production"
  ```
* Keeping `secure: true` in development causes HTTP local rest clients (like VS Code REST Client) to reject the cookie, making testing token refreshes impossible.
