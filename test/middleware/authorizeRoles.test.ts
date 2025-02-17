import { AccessToken } from "@/db/models/AccessToken";
import { RefreshToken } from "@/db/models/RefreshToken";
import { Role } from "@/db/models/Role";
import { User } from "@/db/models/User";
import { UserRole } from "@/db/models/UserRole";
import authorizeRoles from "@/middleware/authorizeRoles";
import { Roles, useAuthService } from "@/services/auth";
import { Sequelize } from "sequelize-typescript";

describe("Authorize Roles Middleware", () => {
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

  it("should return 403 if authenticated user does not have required role", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });
    const token = await authService.generateToken(user, [
      new Role({ id: Roles.GROWER, rolename: "Grower" }),
    ]);
    const tokenData = await authService.verifyToken(token);

    const ctx = {
      currentUserTokenData: tokenData,
    } as any;
    const middleware = authorizeRoles([Roles.ADMIN]);
    await middleware(ctx, () => {
      return Promise.resolve();
    });
    expect(ctx.status).toBe(403);
  });

  it("should proceed if the user has the required role", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });
    const token = await authService.generateToken(user, [
      new Role({ id: Roles.ADMIN, rolename: "ADMIN" }),
    ]);
    const tokenData = await authService.verifyToken(token);

    const ctx = {
      currentUserTokenData: tokenData,
    } as any;
    const middleware = authorizeRoles([Roles.ADMIN]);
    let response = "";
    await middleware(ctx, () => {
      response = "success";
      return Promise.resolve();
    });
    expect(response).toBe("success");
  });

  it("should proceed if no required roles are provided", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });
    const token = await authService.generateToken(user, [
      new Role({ id: Roles.ADMIN, rolename: "ADMIN" }),
    ]);
    const tokenData = await authService.verifyToken(token);

    const ctx = {
      currentUserTokenData: tokenData,
    } as any;
    const middleware = authorizeRoles();
    let response = "";
    await middleware(ctx, () => {
      response = "success";
      return Promise.resolve();
    });
    expect(response).toBe("success");
  });
});
