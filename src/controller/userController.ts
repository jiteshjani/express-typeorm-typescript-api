import { Request, Response, NextFunction } from 'express';
import { User } from '../entity/User';
import { validate } from 'class-validator';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({
      relations: ['stores'],
    });
    return res.status(200).json({
      status: 'success',
      users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOneOrFail(req.params.id, {
      relations: ['stores'],
    });
    return res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentUser, username, email, password } = req.body;
    const user = await User.findOneOrFail(currentUser.id);

    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password || user.password;
    const errors = await validate(user);
    if (errors.length > 0) {
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
    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentUser } = req.body;
    const user = await User.findOneOrFail(req.params.id);
    if (currentUser.id !== user.id) {
      return next({
        statusCode: 403,
        status: 'fail',
        message: 'you are not allowed to perform that action',
      });
    }
    await user.remove();
    res.status(204).json({
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
