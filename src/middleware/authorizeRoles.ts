import { Next } from "koa";
import { RouterContext } from "@koa/router";
import { Roles, TokenPayload } from "@/services/auth";
import { abort } from "@/utils/request";

const authorizeRoles = function (allowedRoles: Roles[] = []) {
  return async (ctx: RouterContext, next: Next) => {
    const currentUser = ctx.currentUserTokenData as TokenPayload;
    const userRoles = new Set(currentUser.roles);
    const hasAllowedRole =
      allowedRoles.some((allowedRole) => userRoles.has(allowedRole)) ||
      allowedRoles.length === 0;
    if (!hasAllowedRole) {
      return abort(ctx, 403, "Not authorized");
    }
    await next();
  };
};

export default authorizeRoles;
