import { Next } from "koa";
import { RouterContext } from "@koa/router";
import { SchemaMap } from "joi";

import Joi from "joi";
import { abort } from "@/utils/request";

const validateBody = function (schemaMap: SchemaMap) {
  const schema = Joi.object(schemaMap);
  return async (ctx: RouterContext, next: Next) => {
    const { error } = schema.validate(ctx.request.body);
    if (error) {
      return abort(ctx, 422, error.message);
    }
    await next();
  };
};

export default validateBody;
