import 'reflect-metadata';
import { createConnection } from 'typeorm';

import appCreator from './app';

createConnection()
  .then(async () => {
    const app = appCreator();
    app.listen(3000, () => {
      console.log(`[APP] http://localhost:3000`);
    });
  })
  .catch((error) => console.log(error));
