import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV}` });
import "module-alias/register";
import { Sequelize } from "sequelize-typescript";
import prompt from "prompt";

const confirmRun = async () => {
  console.log(
    `About to execute the command in ${process.env.NODE_ENV} environment.`
  );

  const { sure } = await prompt.get([
    {
      name: "sure",
      description: "Are you sure? (y/n)",
      type: "string",
      required: true,
    },
  ]);

  if (sure !== "y") {
    console.log("Command aborted!\n");
    process.exit(1);
  }
};

confirmRun()
  .then(() => {
    // Create DB tables if they don't exist
    const sequelize = new Sequelize({
      database: process.env.DATABASE,
      dialect: "mysql",
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_URI,
      port: Number(process.env.DATABASE_PORT),
      models: [__dirname + "/../models"],
    });
    sequelize.sync();
  })
  .catch(() => process.exit(1));
