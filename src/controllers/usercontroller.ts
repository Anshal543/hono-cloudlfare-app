import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";
import { Context } from "hono";
import { sign } from "hono/jwt";
import { signupSchema } from "../types/usertypes";

enum StatusCode {
  BADREQ = 400,
  NOTFOUND = 404,
  FORBIDDEN = 403,
  SERVER_ERROR = 500,
}

type SignupBody = {
  username: string;
  email: string;
  password: string;
};

export async function signup(c: Context) {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body: SignupBody = await c.req.json();

    const parsedUser = signupSchema.safeParse(body);
    if (!parsedUser.success) {
      return c.json(
        { message: "Invalid input", errors: parsedUser.error.errors },
        StatusCode.BADREQ
      );
    }

    const isUserExist = await prisma.user.findFirst({
      where: { email: body.email },
    });

    if (isUserExist) {
      return c.json({ message: "User already exists" }, StatusCode.BADREQ);
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        password: hashedPassword,
      },
    });
    const token = await sign({ userId: newUser.id }, c.env.JWT_SECRET);

    return c.json({
      message: "User created successfully",
      token: token,
      data: {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      status: 201,
    });
  } catch (error) {
    return c.json({ message: error });
  }
}
