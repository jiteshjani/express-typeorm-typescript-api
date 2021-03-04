import { Request, Response, NextFunction } from 'express';
import argon2 from 'argon2';
import { verify, sign } from 'jsonwebtoken';

import { User } from '../entity/User';
import { validate } from 'class-validator';

// TODO: add these variables in .env
const secret = <string>process.env.JWT_SECRET || '1234';
const expiresIn = <string>process.env.JWT_EXPIRES || '90d';

interface IDecoded {
  id: number;
  iat: number;
  exp: number;
}

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    const user = User.create({ username, email, password });
    const errors = await validate(user);
    if (errors.length > 0) {
      // TODO: should be handled in global error parser class
      let message = [];
      errors.forEach((Obj) => {
        const object = Obj.constraints;
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            message.push(object[key]);
          }
        }
      });
      return next({
        status: 'fail',
        statusCode: 400,
        message,
      });
    }
    await user.save();

    const token = sign({ id: user.id }, secret, {
      expiresIn,
    });
    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password'],
    });

    if (!user || !(await argon2.verify(user.password, password))) {
      return next({
        statusCode: 401,
        status: 'fail',
        message: 'invalid credentials',
      });
    }
    const token = sign({ id: user.id }, secret, {
      expiresIn,
    });
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const guard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next({
        statusCode: 401,
        status: 'fail',
        message: 'missing authorization token',
      });
    }
    const decoded = <IDecoded>verify(token, secret);

    const currentUser = await User.findOneOrFail(decoded.id);
    // TODO: should add more checks, e.g. user still exists, changed password etc.
    const body = req.body;
    req.body = { currentUser, ...body };
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
