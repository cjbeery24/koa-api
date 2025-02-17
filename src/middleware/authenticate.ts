import { useAuthService } from "@/services/auth";
import { RouterContext } from "@koa/router";
import { Next } from "koa";
import { abort } from "@/utils/request";
const authenticate = async (ctx: RouterContext, next: Next) => {
  const token = ctx.header.authorization?.replace("Bearer ", "");

  if (!token) {
    return abort(ctx, 401, "Please provide an auth token");
  }
  const authService = useAuthService();
  const decoded = await authService.verifyToken(token);
  if (!decoded) {
    return abort(ctx, 401, "Invalid auth token");
  }

  ctx.currentUserToken = token;
  ctx.currentUserTokenData = decoded;

  await next();
};

export default authenticate;
