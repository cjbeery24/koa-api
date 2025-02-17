// import "module-alias/register";
import app from "@/app";

const port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 8080;
const server = app.listen(port);

export default server;
