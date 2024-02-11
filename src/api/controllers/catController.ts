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

const catGetByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
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
    const cats = await catModel.find({owner: user._id});
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGetByBoundingBox = async (
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
    const coords = res.locals.coords as number[];
    const cats = await catModel.find({
      location: {
        $geoWithin: {
          $box: coords,
        },
      },
    });
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
    next(new CustomError('Error cat get bounding box', 500));
  }
};

const catGet = async (
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
    const cat = await catModel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('Cat not found', 404));
      return;
    }
    res.json(cat);
  } catch (error) {
    next(new CustomError('Error getting cat', 500));
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Partial<Cat>>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  const user = res.locals.user as User;
  const cat = await catModel.findById(req.params.id);
  const _cat = {
    _id: cat!._id,
    cat_name: cat!.cat_name,
    weight: cat!.weight,
    filename: cat!.filename,
    birthdate: cat!.birthdate,
    location: cat!.location,
    owner: {
      _id: cat!.owner._id.toString(),
    },
  };
  if (user._id !== _cat.owner._id) {
    next(new CustomError('Not authorized', 401));
    return;
  }
  try {
    const cat: Partial<Cat> = req.body;
    const result = await catModel.findByIdAndUpdate(_cat._id, cat, {
      new: true,
    });
    res.json({
      message: 'Cat updated',
      data: {
        _id: result!._id,
        cat_name: result!.cat_name,
        weight: result!.weight,
        filename: result!.filename,
        birthdate: result!.birthdate,
        location: result!.location,
        owner: result!.owner,
      },
    });
  } catch (e) {
    next(e);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Partial<Cat>>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  const user = res.locals.user as User;
  if (user.role !== 'admin') {
    next(new CustomError('Not admin', 403));
    return;
  }
  try {
    const cat: Partial<Cat> = req.body;
    const result = await catModel.findByIdAndUpdate(req.params.id, cat, {
      new: true,
    });
    res.json({
      message: 'Cat updated',
      data: {
        _id: result!._id,
        cat_name: result!.cat_name,
        weight: result!.weight,
        filename: result!.filename,
        birthdate: result!.birthdate,
        location: result!.location,
        owner: result!.owner,
      },
    });
  } catch (e) {
    next(e);
  }
};

const catDelete = async (
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
    const user = res.locals.user as User;
    const cat = await catModel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('Cat not found', 404));
      return;
    }
    if (user._id !== cat.owner._id.toString()) {
      next(new CustomError('Not authorized', 401));
      return;
    }
    await cat.deleteOne();
    res.json({message: 'Cat deleted'});
  } catch (error) {
    next(new CustomError('Error deleting cat', 500));
  }
};

const catDeleteAdmin = async (
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
    const user = res.locals.user as User;
    if (user.role !== 'admin') {
      next(new CustomError('Not admin', 403));
      return;
    }
    const cat = await catModel.findById(req.params.id);
    if (!cat) {
      next(new CustomError('Cat not found', 404));
      return;
    }
    await cat.deleteOne();
    res.json({message: 'Cat deleted'});
  } catch (error) {
    next(new CustomError('Error deleting cat', 500));
  }
};

export {
  catPost,
  catListGet,
  catGetByUser,
  catGetByBoundingBox,
  catGet,
  catPut,
  catPutAdmin,
  catDelete,
  catDeleteAdmin,
};
