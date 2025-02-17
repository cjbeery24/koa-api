import { Role } from "@/db/models/Role";
import { User } from "@/db/models/User";
import { UserRole } from "@/db/models/UserRole";
import { Sequelize } from "sequelize-typescript";

describe("UserModel", () => {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
    models: [User, Role, UserRole],
  });

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should not return password when turned into JSON", async () => {
    const userModel = new User({
      email: "test@test.com",
      password: "password",
    });
    const userJSON = userModel.toJSON();
    expect(userJSON).toHaveProperty("email");
    expect(userJSON).not.toHaveProperty("password");
  });
});
