import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { register } from "./registrationController";

dotenv.config();

const app: Application = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/register", (req: Request, res: Response) => {
  console.log("Body = ");
  const body = req.body;
  console.dir(body);
  const response = register(body);
  console.dir(response);
  res.send({ response });
});

app.post("/*", (_req: Request, res: Response) => {
  res.status(404).send("The only post request available is POST /register");
});

app.get("/*", (_req: Request, res: Response) => {
  res.status(404).send("Sorry, Something went error");
});

try {
  const port = process.env.SERVER_PORT;
  app.listen(port, () =>
    console.log(`Server is running in http://localhost:${port}`)
  );
} catch (error) {
  console.error(error);
}
