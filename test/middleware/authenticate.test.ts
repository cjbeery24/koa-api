import { AccessToken } from "@/db/models/AccessToken";
import { RefreshToken } from "@/db/models/RefreshToken";
import { Role } from "@/db/models/Role";
import { User } from "@/db/models/User";
import { UserRole } from "@/db/models/UserRole";
import authenticate from "@/middleware/authenticate";
import { useAuthService } from "@/services/auth";
import Router from "@koa/router";
import { Sequelize } from "sequelize-typescript";

describe("Authenticate Middleware", () => {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
    models: [User, Role, UserRole, AccessToken, RefreshToken],
  });

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should authenticate successfully with a valid auth token", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });
    const token = await authService.generateToken(user);
    const ctx = {
      header: { authorization: `Bearer ${token}` },
    } as Router.RouterContext;
    await authenticate(ctx, () => {
      return Promise.resolve();
    });
    expect(ctx.currentUserTokenData).toBeDefined();
  });

  it("should fail authentication if no token is provided", async () => {
    const ctx = {
      header: {},
    } as Router.RouterContext;
    await authenticate(ctx, () => {
      return Promise.resolve();
    });
    expect(ctx.status).toBe(401);
  });

  it("should fail authentication with an invalid auth token", async () => {
    const ctx = {
      header: { authorization: `Bearer wrongtoken}` },
    } as Router.RouterContext;
    await authenticate(ctx, () => {
      return Promise.resolve();
    });
    expect(ctx.status).toBe(401);
  });
});
