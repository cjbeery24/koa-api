import Router from "@koa/router";
import { User } from "@/db/models/User";
import { useAuthService } from "@/services/auth";
import Joi from "joi";
import validateBody from "@/middleware/validateBody";
import { Role } from "@/db/models/Role";
import { abort } from "@/utils/request";

const authRouter = new Router();

authRouter.post(
  "/register",
  validateBody({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  async (ctx: Router.RouterContext) => {
    const { email, password } = ctx.request.body as {
      email: string;
      password: string;
    };

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return abort(ctx, 422, "Email already taken");
    }
    const authService = useAuthService();
    const hashedPassword = authService.hashPassword(password);
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });
    ctx.body = { token: await authService.generateToken(newUser) };
    const token = await authService.generateToken(newUser);
    const refreshToken = await authService.retrieveRefreshToken(token);
    ctx.body = {
      token,
      refreshToken,
    };
  }
);

authRouter.post(
  "/login",
  validateBody({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  async (ctx: Router.RouterContext) => {
    const { email, password } = ctx.request.body as {
      email: string;
      password: string;
    };
    const authService = useAuthService();
    const user = await User.findOne({ where: { email }, include: [Role] });
    if (!user || !authService.comparePassword(password, user.password)) {
      return abort(ctx, 401, "Invalid credentials");
    }
    const token = await authService.generateToken(user, user.roles);
    const refreshToken = await authService.retrieveRefreshToken(token);
    ctx.body = { token, refreshToken };
  }
);

authRouter.post(
  "/refresh-token",
  validateBody({
    refreshToken: Joi.string().required(),
  }),
  async (ctx: Router.RouterContext) => {
    const authService = useAuthService();
    const { refreshToken } = ctx.request.body as { refreshToken: string };
    const token = await authService.refreshAuthToken(refreshToken);
    if (!token) {
      return abort(ctx, 401, "Invalid refresh token");
    }

    const newRefreshToken = await authService.retrieveRefreshToken(token);
    ctx.body = { token, refreshToken: newRefreshToken };
  }
);

export default authRouter;
