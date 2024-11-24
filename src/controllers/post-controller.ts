import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

enum StatusCode {
  BADREQ = 400,
  NOTFOUND = 404,
  NOTPERMISSIOON = 403,
}

export async function getPosts(c: Context) {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const posts = await prisma.posts.findMany({
      include: {
        User: true,
        tags: true,
      },
    });
    if (!posts) {
      return c.json({ message: "No posts found" }, StatusCode.NOTFOUND);
    }
    return c.json(
      posts.map((post) => {
        return {
          id: post.id,
          title: post.title,
          content: post.body,
          user: post.User.username,
          userId: post.userId,
        };
      })
    );
  } catch (error) {
    return c.json({ error: error }, StatusCode.BADREQ);
  }
}

export async function getUserPosts(c: Context) {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const posts = await prisma.posts.findMany({
      where: {
        userId: c.get("userId"),
      },
      // include:{
      //     User:true
      // }
    });
    if (!posts) {
      return c.json({ message: "No posts found" }, StatusCode.NOTFOUND);
    }
    return c.json(posts);
  } catch (error) {
    return c.json({ error: error }, StatusCode.BADREQ);
  }
}

export async function createPost(c: Context) {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body: {
      title: string;
      body: string;
      tags: string
    } = await c.req.json();
    const tagNames = body.tags.split(",").map((tag) => tag.trim());
    if(!body.title || !body.body){
        return c.json({message:"Please provide a title and body"},StatusCode.BADREQ)
    }
    const post = await prisma.posts.create({
      data: {
        title: body.title,
        body: body.body,
        userId: c.get("userId"),
        tags:{
          connectOrCreate:tagNames.map((tag)=>({
            where:{tag},
            create:{tag}
          }))
        }
      },
      include:{
        tags:true
      }
    });
    return c.json({
      id: post.id,
      title: post.title,
      body: post.body,
      userId: post.userId,
      tags:post.tags.map((tag)=>tag.tag)
    });
  } catch (error) {
    return c.json({ error: error }, StatusCode.BADREQ);
  }
}

export async function getPostById(c: Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const post = await prisma.posts.findUnique({
        where: {
            id: parseInt(c.req.param("id")),
            userId: parseInt(c.get("userId")),
        },
        });
        if (!post) {
        return c.json({ message: "No post found" }, StatusCode.NOTFOUND);
        }
        return c.json(post);
    } catch (error) {
        return c.json({ error: error }, StatusCode.BADREQ);
    }
}

export async function updatePost(c:Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const body: {
            title: string;
            body: string;
        } = await c.req.json();
        const post = await prisma.posts.update({
            where:{
                id:parseInt(c.req.param("id"))
            },
            data:{
                title:body.title,
                body:body.body
            }
        })
        return c.json(post)
    } catch (error) {
        return c.json({ error: error }, StatusCode.BADREQ);
    }
}

export async function deletePost(c:Context) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const post = await prisma.posts.delete({
            where:{
                id:parseInt(c.req.param("id"))
            }
        })
        return c.json(post)
    } catch (error) {
        return c.json({ error: error }, StatusCode.BADREQ);
    }
}