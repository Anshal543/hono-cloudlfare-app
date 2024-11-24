import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";
import { Context } from "hono";
import { sign } from "hono/jwt";
import { signupSchema, signinSchema } from "../types/usertypes";

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

export async function signin(c: Context) {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body = await c.req.json();

    const parsedUser = signinSchema.safeParse(body);
    if (!parsedUser.success) {
      return c.json(
        { message: "Invalid input", errors: parsedUser.error.errors },
        StatusCode.BADREQ
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) {
      return c.json({ message: "User not found" }, StatusCode.NOTFOUND);
    }

    const isValid = await bcrypt.compare(body.password, user.password);

    if (!isValid) {
      return c.json({ message: "Invalid password" }, StatusCode.FORBIDDEN);
    }

    const token = await sign({ userId: user.id }, c.env.JWT_SECRET);

    return c.json({
      message: "Logged in successfully",
      token: token,
      data: {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    return c.json({ message: error });
  }
}

export async function userProfile(c: Context) {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const user = await prisma.user.findFirst({
      where: { id: Number(c.req.param("userId")) },
      include: { posts: true },
    });
    if (!user) {
      return c.json({ message: "User not found" }, StatusCode.NOTFOUND);
    }
    const { password, ...rest } = user;

    return c.json({ message: "User profile", data: rest });
  } catch (error) {
    return c.json({ message: error });
  }
}

export async function getAllUser(c: Context) {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const users = await prisma.user.findMany();
    return c.json({
      data: users.map((user) => {
        const { password, ...rest } = user;
        return rest;
      }),
    });
  } catch (error) {
    return c.json({ message: error });
  }
}
