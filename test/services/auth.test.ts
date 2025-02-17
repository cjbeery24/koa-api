import { AccessToken } from "@/db/models/AccessToken";
import { RefreshToken } from "@/db/models/RefreshToken";
import { Role } from "@/db/models/Role";
import { User } from "@/db/models/User";
import { UserRole } from "@/db/models/UserRole";
import { Roles, useAuthService } from "@/services/auth";
import { sign, Secret } from "jsonwebtoken";
import { Sequelize } from "sequelize-typescript";

describe("AuthService", () => {
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

  it("should return null on an invalid token verification", async () => {
    const authService = useAuthService();
    const tokenPayload = await authService.verifyToken("junk");
    expect(tokenPayload).toBeNull();
  });

  it("should return a TokenPayload for a verified token string", async () => {
    const secretKey: Secret = process.env.JWT_SECRET_KEY
      ? process.env.JWT_SECRET_KEY
      : "";
    const token = sign(
      {
        uid: 1,
        r: [],
        rt: "",
      },
      secretKey,
      { expiresIn: `${86400}s` }
    );
    const authService = useAuthService();
    const tokenPayload = await authService.verifyToken(token);
    expect(tokenPayload).not.toBeNull();
    expect(tokenPayload).toHaveProperty("userId");
    expect(tokenPayload?.userId).toBe(1);
  });

  it("should create a token for a user that can be decoded into a TokenPayload", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });
    const token = await authService.generateToken(user, [
      new Role({ id: Roles.ADMIN, rolename: "ADMIN" }),
    ]);
    expect(typeof token).toBe("string");

    const tokenPayload = await authService.verifyToken(token);
    expect(tokenPayload).not.toBeNull();
    expect(tokenPayload?.userId).toBe(user.id);
    expect(tokenPayload?.roles).toContain(Roles.ADMIN);
  });

  it("should fail to verify an expired token", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });
    const token = await authService.generateToken(
      user,
      [new Role({ id: Roles.ADMIN, rolename: "ADMIN" })],
      1
    );
    expect(typeof token).toBe("string");
    await new Promise((r) => setTimeout(r, 1500));
    const tokenPayload = await authService.verifyToken(token);
    expect(tokenPayload).toBeNull();
  });

  it("should create a new token from a refresh token", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });

    const token = await authService.generateToken(user, []);
    let tokenPayload = await authService.verifyToken(token);
    expect(tokenPayload).not.toBeNull();
    tokenPayload = tokenPayload!;
    expect(tokenPayload.refreshToken).toBeDefined();
    let newToken = await authService.refreshAuthToken(
      tokenPayload.refreshToken
    );
    expect(newToken).not.toBeNull();
    newToken = newToken!;
    const newTokenPayload = await authService.verifyToken(newToken);
    expect(newTokenPayload?.userId).toBe(tokenPayload.userId);
  });

  it("should create be able to retrieve the refresh token from an auth token", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });

    const token = await authService.generateToken(user, []);
    const refreshToken = await authService.retrieveRefreshToken(token);
    let tokenPayload = await authService.verifyToken(token);
    expect(tokenPayload).not.toBeNull();
    tokenPayload = tokenPayload!;
    expect(refreshToken).toBe(tokenPayload.refreshToken);
  });

  it("should not retrieve the refresh token from an expired auth token", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });

    const token = await authService.generateToken(user, [], 1);
    await new Promise((r) => setTimeout(r, 1500));
    const refreshToken = await authService.retrieveRefreshToken(token);
    expect(refreshToken).toBeNull();
  });

  it("should return null when trying to refresh an invalid token", async () => {
    const authService = useAuthService();

    let newToken = await authService.refreshAuthToken("junk");
    expect(newToken).toBeNull();
  });

  it("should be able to blacklist a token and have that token verification fail", async () => {
    const authService = useAuthService();
    const user = await User.create({
      email: "test@test.com",
      password: "testing",
    });
    const token = await authService.generateToken(user, []);
    expect(typeof token).toBe("string");

    const tokenPayload = await authService.verifyToken(token);
    expect(tokenPayload).not.toBeNull();
    expect(tokenPayload?.userId).toBe(user.id);
    await authService.blacklistToken(token);
    const blackListedTokenPayload = await authService.verifyToken(token);
    expect(blackListedTokenPayload).toBeNull();
  });

  it("should be able to compare a hashed password", async () => {
    const authService = useAuthService();
    const password = "password";
    const hashedPassword = authService.hashPassword(password);
    const passwordMatch = authService.comparePassword(password, hashedPassword);
    expect(passwordMatch).toBeTruthy();
  });
});
