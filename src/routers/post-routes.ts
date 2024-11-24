import { Hono } from "hono";
import { createPost, deletePost, getPostById, getPosts, getUserPosts, updatePost } from "../controllers/post-controller";
import { authMiddleware } from "../middlewares/auth-middleware";


export const postRouter = new Hono()

postRouter.get("/all-posts",getPosts)
postRouter.get("/post",authMiddleware,getUserPosts)
postRouter.post("/create-post",authMiddleware,createPost)
postRouter.get("/:id",authMiddleware,getPostById)
postRouter.patch("/update/:id",authMiddleware,updatePost)
postRouter.delete("/delete/:id",authMiddleware,deletePost)