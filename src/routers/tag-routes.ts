import { Hono } from "hono";
import { getPostsByTag, getTags } from "../controllers/tag-controller";


export const tagRouter = new Hono();

tagRouter.get('/getPost/:tag', getPostsByTag);
tagRouter.get('/tags', getTags);