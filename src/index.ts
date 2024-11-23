import { Hono } from "hono";
import { userRouter } from "./routers/userroutes";

export type bindings = {
  JWT_SECRET: string;
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: bindings }>();

app.route("/api/v1/user", userRouter);

export default app;
