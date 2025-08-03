import { ZodObject } from "zod";
import catchAsync from "../utils/catchAsync";

const validateRequest = (schema: ZodObject) => {
  return catchAsync(async (req, res, next) => {
    await schema.parseAsync({
      body: JSON.parse(req.body?.data) || req.body,
      cookies: req.cookies,
    });

    next();
  });
};

export default validateRequest;
