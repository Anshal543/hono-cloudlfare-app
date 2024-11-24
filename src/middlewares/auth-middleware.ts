import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export async function authMiddleware(c: Context, next: Next) {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return c.json({ message: "Unauthenticated" }, 401);
    }
    const decoded = await verify(token, c.env.JWT_SECRET);
    if (!decoded) {
      return c.json({ message: "Unauthenticated" }, 401);
    }
    c.set("userId", decoded.userId);
    await next();
  } catch (error) {
    return c.json({ message: "Unauthenticated" }, 401);
  }
}
