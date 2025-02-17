import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV}` });
import Koa from "koa";
import bodyParser = require("koa-bodyparser");
import koaSimpleHealthcheck from "koa-simple-healthcheck";
import "./db/connection";
import { directoryImport } from "directory-import";
import Router = require("@koa/router");
import helmet from "koa-helmet";

const app = new Koa();

app.use(helmet());
app.use(bodyParser());

// Dynamically build app router
const appRouter = new Router();
const routes = directoryImport("./routes");
Object.keys(routes).forEach((routeKey) => {
  const moduleData = routes[routeKey] as { default: any };
  const eachRouter = moduleData.default as Router;
  const routeName = routeKey.split(".")[0];
  appRouter.use(routeName, eachRouter.routes(), eachRouter.allowedMethods());
});
app.use(appRouter.routes()).use(appRouter.allowedMethods());

app.use(
  koaSimpleHealthcheck({
    path: "/",
    healthy: function () {
      return { uptime: process.uptime() };
    },
  })
);

export default app;
