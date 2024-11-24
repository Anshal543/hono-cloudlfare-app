import { Hono } from "hono";
import { userRouter } from "./routers/userroutes";
import { postRouter } from "./routers/post-routes";

export type bindings = {
  JWT_SECRET: string;
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: bindings }>();

app.route("/api/v1/users", userRouter);
app.route("/api/v1/posts", postRouter);

export default app;
