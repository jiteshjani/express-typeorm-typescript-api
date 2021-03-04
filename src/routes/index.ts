import { Router, Request, Response, NextFunction } from 'express';
import authRouter from './api/auth';
import storeRouter from './api/store';
import userRouter from './api/user';

const router = Router();
interface IAppError {
  statusCode?: number;
  status?: string;
  message?: string;
}

// Create generic public route
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send('Hello World');
});

// Register API routes
router.use('/api/auth', authRouter);
router.use('/api/user', userRouter);
router.use('/api/store', storeRouter);

// Create catch-all route and send 404
router.all('*', (req: Request, res: Response, next: NextFunction) => {
  const error = {
    statusCode: 404,
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  };
  next(error);
});

// Create global error handler
// TODO: Implement a global error handler class for parsing validation and runtime errors
router.use(
  (err: IAppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    const message =
      err.message || 'something went wrong, please try again later';
    res.status(statusCode).json({
      status,
      message,
    });
  }
);

export default router;
