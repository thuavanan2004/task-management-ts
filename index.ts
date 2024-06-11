import express, { Express, Response, Request } from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import cors from "cors";
env.config();
import { v1Route } from "./v1/routes/index.route";
import { connect } from "./config/database";
connect();

const app: Express = express();
const port: string | number = `${process.env.PORT}` || 3002;

app.use(cors());

app.use(bodyParser.json());
v1Route(app);

app.listen(port, () => {
  console.log(`App đang lắng nghe cổng PORT ${port}`);
});
