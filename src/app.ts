import 'reflect-metadata';
import express from 'express';
import database from './database';
import router from './routes';

database();

const app = express();

app.use(express.json());
app.use(router);

export default app;
