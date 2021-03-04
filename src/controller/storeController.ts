import { Request, Response, NextFunction } from 'express';

import { User } from '../entity/User';
import { Store } from '../entity/Store';
import { validate } from 'class-validator';

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, currentUser } = req.body;
    const user = await User.findOneOrFail(currentUser.id);
    const store = new Store();
    store.name = name;
    store.user = user;
    const errors = await validate(store);
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
    await store.save();

    return res.status(201).json({
      status: 'success',
      store,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getStores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stores = await Store.find({ relations: ['user'] });
    return res.status(200).json({
      status: 'success',
      stores,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getStoreById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await Store.findOneOrFail(req.params.id, {
      relations: ['user'],
    });
    return res.status(200).json({
      status: 'success',
      store,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const updateStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentUser, name } = req.body;
    const store = await Store.findOneOrFail(req.params.id, {
      relations: ['user'],
    });
    // TODO: This logic can be added to the auth.guard middleware to avoid repetition
    if (currentUser.id !== store.user.id) {
      return next({
        statusCode: 403,
        status: 'fail',
        message: 'you are not allowed to perform that action',
      });
    }
    store.name = name || store.name;
    const errors = await validate(store);
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
    await store.save();
    res.status(200).json({
      status: 'success',
      store,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentUser } = req.body;
    const store = await Store.findOneOrFail(req.params.id, {
      relations: ['user'],
    });
    if (currentUser.id !== store.user.id) {
      return next({
        statusCode: 403,
        status: 'fail',
        message: 'you are not allowed to perform that action',
      });
    }
    await store.remove();
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
