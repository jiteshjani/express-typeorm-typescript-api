import 'reflect-metadata';
import express, { Application } from 'express';

import appRoutes from './routes';

const appCreator = () => {
  // Create app
  const app: Application = express();

  // Configure app
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Register app routes
  app.use(appRoutes);

  return app;
};

export default appCreator;
