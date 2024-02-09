import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
import {catModel} from '../models/catModel';
import CustomError from '../../classes/CustomError';
import {User, Cat} from '../../types/DBTypes';

// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat

const catPost = async (
  req: Request<{}, {}, Cat>,
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
    const user = res.locals.user as User;
    const cat: Omit<Cat, '_id'> = {
      cat_name: req.body.cat_name,
      weight: req.body.weight,
      filename: req.file!.filename,
      birthdate: req.body.birthdate,
      location: res.locals.coords,
      owner: user,
    };
    const newCat = await catModel.create(cat);
    res.json({
      message: 'Cat created',
      data: newCat,
    });
  } catch (error) {
    next(new CustomError('Error creating cat', 500));
  }
};

const catListGet = async (
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
    const cats = await catModel.find({});
    const catList = cats.map((cat) => {
      return {
        _id: cat._id,
        cat_name: cat.cat_name,
        weight: cat.weight,
        filename: cat.filename,
        birthdate: cat.birthdate,
        location: cat.location,
        owner: cat.owner,
      };
    });
    res.json(catList);
  } catch (error) {
    next(new CustomError('Error getting cats', 500));
  }
};

export {catPost, catListGet};
