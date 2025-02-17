import Router from "@koa/router";

export function abort(
  ctx: Router.RouterContext,
  status: number,
  message: string
) {
  ctx.status = status;
  ctx.body = { message };
}
