// import { Hono } from "hono";
// import { signup } from "../controllers/usercontroller";

// export const userRouter = new Hono();

// userRouter.post('/signup',signup)

import { Hono } from "hono";
import { signup } from "../controllers/usercontroller";

export const userRouter = new Hono();

// Signup route
userRouter.post("/signup", signup);
