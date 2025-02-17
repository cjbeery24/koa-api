import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
  database: process.env.DATABASE,
  dialect: "mysql",
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_URI,
  port: Number(process.env.DATABASE_PORT),
  models: [__dirname + "/models"],
});

export default sequelize;
