import request from "supertest";
import app from "@/app";
import { User } from "@/db/models/User";
import { Role } from "@/db/models/Role";
import { UserRole } from "@/db/models/UserRole";
import { AccessToken } from "@/db/models/AccessToken";
import { RefreshToken } from "@/db/models/RefreshToken";
import { Sequelize } from "sequelize-typescript";
import { useAuthService } from "@/services/auth";

describe("POST /auth/register", () => {
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

  it("should return 200 OK and an auth token", async () => {
    const email = "test@testing.com";
    const password = "password";

    const response = await request(app.callback())
      .post("/auth/register")
      .send({
        email,
        password,
      })
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");

    const accessToken = response.body.token;
    const tokenRecord = await AccessToken.findByPk(accessToken, {
      include: [User],
    });
    expect(tokenRecord).not.toBeNull();
    expect(tokenRecord).toHaveProperty("user");
    expect(tokenRecord?.user?.email).toBe(email);
  });

  it("should return 422 if email is already taken", async () => {
    const email = "test@testing.com";
    await User.create({
      email,
      password: useAuthService().hashPassword("password"),
    });
    const response = await request(app.callback())
      .post("/auth/register")
      .send({
        email,
        password: "password",
      })
      .set("Accept", "application/json");
    expect(response.status).toBe(422);
  });

  it("should return 422 if email or password is not sent", async () => {
    const passwordResponse = await request(app.callback())
      .post("/auth/register")
      .send({
        password: "wrongpassword",
      })
      .set("Accept", "application/json");
    expect(passwordResponse.status).toBe(422);
    expect(passwordResponse.body).toHaveProperty("message");

    const emailResponse = await request(app.callback())
      .post("/auth/register")
      .send({
        email: "test@testing.com",
      })
      .set("Accept", "application/json");
    expect(emailResponse.status).toBe(422);
    expect(emailResponse.body).toHaveProperty("message");
  });
});

describe("POST /auth/login", () => {
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

  it("should return 200 OK and an auth token", async () => {
    const email = "test@testing.com";
    const password = "password";
    const user = await User.create({
      email,
      password: useAuthService().hashPassword(password),
    });
    const response = await request(app.callback())
      .post("/auth/login")
      .send({
        email,
        password,
      })
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");
  });

  it("should return 401 if invalid credentials", async () => {
    const email = "test@testing.com";
    const password = "password";
    const user = await User.create({
      email,
      password: useAuthService().hashPassword(password),
    });
    const response = await request(app.callback())
      .post("/auth/login")
      .send({
        email,
        password: "wrongpassword",
      })
      .set("Accept", "application/json");
    expect(response.status).toBe(401);
  });

  it("should return 422 if email or password is not sent", async () => {
    const passwordResponse = await request(app.callback())
      .post("/auth/login")
      .send({
        password: "wrongpassword",
      })
      .set("Accept", "application/json");
    expect(passwordResponse.status).toBe(422);
    expect(passwordResponse.body).toHaveProperty("message");

    const emailResponse = await request(app.callback())
      .post("/auth/login")
      .send({
        email: "test@testing.com",
      })
      .set("Accept", "application/json");
    expect(emailResponse.status).toBe(422);
    expect(emailResponse.body).toHaveProperty("message");
  });
});

describe("POST /auth/refresh-token", () => {
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

  it("should return 200 OK and an auth token", async () => {
    const email = "test@testing.com";
    const password = "password";
    const user = await User.create({
      email,
      password: useAuthService().hashPassword(password),
    });
    const response = await request(app.callback())
      .post("/auth/login")
      .send({
        email,
        password,
      })
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("refreshToken");

    const refreshToken = response.body.refreshToken;
    const refreshResponse = await request(app.callback())
      .post("/auth/refresh-token")
      .send({
        refreshToken,
      })
      .set("Accept", "application/json");
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty("token");
    expect(refreshResponse.body).toHaveProperty("refreshToken");
  });

  it("should return 401 if the refreshToken is invalid", async () => {
    const refreshResponse = await request(app.callback())
      .post("/auth/refresh-token")
      .send({
        refreshToken: "wrongtoken",
      })
      .set("Accept", "application/json");
    expect(refreshResponse.status).toBe(401);
  });

  it("should return 422 if the refreshToken is not sent", async () => {
    const refreshResponse = await request(app.callback())
      .post("/auth/refresh-token")
      .set("Accept", "application/json");

    expect(refreshResponse.status).toBe(422);
    expect(refreshResponse.body).toHaveProperty("message");
  });
});
