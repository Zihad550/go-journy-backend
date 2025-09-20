import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    ride: z.string({
      message: 'Ride ID is required',
    }),
    rating: z
      .number({
        message: 'Rating is required',
      })
      .int({ message: 'Rating must be an integer' })
      .min(1, { message: 'Rating must be at least 1' })
      .max(5, { message: 'Rating must be at most 5' }),
    comment: z
      .string()
      .max(500, { message: 'Comment must not exceed 500 characters' })
      .trim()
      .optional(),
  }),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .int({ message: 'Rating must be an integer' })
      .min(1, { message: 'Rating must be at least 1' })
      .max(5, { message: 'Rating must be at most 5' })
      .optional(),
    comment: z
      .string()
      .max(500, { message: 'Comment must not exceed 500 characters' })
      .trim()
      .optional(),
  }),
});

const getDriverReviewsValidationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export const ReviewValidations = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
  getDriverReviewsValidationSchema,
};
