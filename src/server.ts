import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { register } from "./controllers/registrationController";
import { benchmark } from './controllers/benchmarkController';
import { promises } from 'fs';

dotenv.config();

const fs = promises;
const app: Application = express();

app.use(morgan('dev', { immediate: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register', (req: Request, res: Response) => {
  const body = req.body;
  const response = register(body);
  console.dir(response);
  res.send(response);
});

app.post('/reset', async (req: Request, res: Response) => {
  const body = req.body;
  try {
    await fs.writeFile('./csp/configs.json', body, 'utf8');
    res.status(200).send('Configs file is written successfully');
  } catch(error) {
    console.error(error);
    res.status(400).send('Error in updating the Configs file');
  }
});

app.post('/score', (req: Request, res: Response) => {
  const body = req.body;
  const response = benchmark(body);
  res.send(response);
});

app.post('/*', (_req: Request, res: Response) => {
  res.status(404).send('The only post requests available are POST /register or POST /reset');
});

app.get('/*', (_req: Request, res: Response) => {
  res.status(404).send('Sorry, Something went error');
});

try {
  const port = process.env.SERVER_PORT;
  app.listen(port, () => console.log(`Server is running in http://localhost:${port}`));
} catch (error) {
  console.error(error);
}
