import Router from "@koa/router";
import authenticate from "@/middleware/authenticate";
import authorizeRoles from "@/middleware/authorizeRoles";
import { Roles } from "@/services/auth";

const router = new Router();

router.get(
  "/",
  authenticate,
  authorizeRoles([Roles.SOFTWARE_DEV, Roles.ADMIN]),
  async (ctx: Router.RouterContext) => {
    // Only allow access if authenticated
    ctx.body = "Hello authenticated";
  }
);

export default router;
