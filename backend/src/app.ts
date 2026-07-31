import express, { type Express } from "express";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3000`);
});
