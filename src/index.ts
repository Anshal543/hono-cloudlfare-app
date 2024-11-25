import { Hono } from "hono";
import { userRouter } from "./routers/userroutes";
import { postRouter } from "./routers/post-routes";
import { tagRouter } from "./routers/tag-routes";
import { Context } from "hono/jsx";

export type bindings = {
  JWT_SECRET: string;
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: bindings }>();

app.route("/api/v1/users", userRouter);
app.route("/api/v1/posts", postRouter);
app.route("/api/v1/tags", tagRouter);

app.get("/", async (c) => {
  return c.text("Hello World");
});

export default app;
