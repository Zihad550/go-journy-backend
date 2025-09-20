import { ZodObject } from "zod";
import catchAsync from "../utils/catchAsync";

const validateRequest = (schema: ZodObject) => {
  return catchAsync(async (req, res, next) => {
    let data;
    if (req?.body?.data) data = JSON.parse(req.body.data);
    else data = req?.body;
    await schema.parseAsync({
      body: data,
      cookies: req.cookies,
      params: req.params,
      query: req.query,
    });

    next();
  });
};

export default validateRequest;
