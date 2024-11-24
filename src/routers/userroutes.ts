import { Hono } from "hono";
import { getAllUser, signin, signup, userProfile } from "../controllers/usercontroller";
import { authMiddleware } from "../middlewares/auth-middleware";

export const userRouter = new Hono();

// Signup route
userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.post("/:userId", authMiddleware ,userProfile);
userRouter.get('/all', authMiddleware, getAllUser);
