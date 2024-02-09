import {userModel} from '../models/userModel';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import {User, UserOutput} from '../../types/DBTypes';
import {Request, Response, NextFunction} from 'express';

// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }
    const userOutput: UserOutput = {
      user_name: user.user_name,
      email: user.email,
      _id: user._id,
    };
    res.json(userOutput);
  } catch (error) {
    next(new CustomError('Error getting user', 500));
  }
};

const userListGet = async (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  try {
    const users = await userModel.find({});
    const userList = users.map((user) => {
      return {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
      };
    });
    res.json(userList);
  } catch (error) {
    next(new CustomError('Error getting user list', 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const user = {
      user_name: req.body.user_name!,
      email: req.body.email!,
      // role: req.body.role!,
      password: bcrypt.hashSync(req.body.password!, 10),
    };
    const newUser = await userModel.create(user);
    res.json({
      message: 'User created',
      data: {
        user_name: newUser.user_name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(new CustomError('Error creating user', 500));
  }
};

const userPutCurrent = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(res.locals.user._id);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const user = await userModel.findByIdAndUpdate(
      res.locals.user._id,
      req.body as User,
      {
        new: true,
      }
    );
    res.json({
      message: 'User updated',
      data: {
        user_name: user!.user_name,
        email: user!.email,
      },
    });
  } catch (error) {
    next(new CustomError('Error updating user', 500));
  }
};

const userDeleteCurrent = async (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(res.locals.user._id);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const user = await userModel.findByIdAndDelete(res.locals.user._id, {
      new: true,
    });
    res.json({
      message: 'User deleted',
      data: {
        user_name: user!.user_name,
        email: user!.email,
      },
    });
  } catch (error) {
    next(new CustomError('Error deleting user', 500));
  }
};

const checkToken = async (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(res.locals.user._id);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  try {
    const user: UserOutput = {
      user_name: res.locals.user.user_name,
      email: res.locals.user.email,
      _id: res.locals.user._id,
    };
    res.json(user);
  } catch (error) {
    next(new CustomError('Error getting user', 500));
  }
};

export {
  userPost,
  userGet,
  userListGet,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
