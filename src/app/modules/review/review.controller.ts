import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import IJwtPayload from '../../interfaces/jwt.interface';
import { ReviewServices } from './review.service';

const createReview = catchAsync(async (req, res) => {
  const result = await ReviewServices.createReview(req.body, req.user as IJwtPayload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviewById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewServices.getReviewById(id, req.user as IJwtPayload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewServices.updateReview(id, req.body, req.user as IJwtPayload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const getDriverReviews = catchAsync(async (req, res) => {
  const { driverId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const result = await ReviewServices.getDriverReviews(
    driverId,
    Number(page),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Driver reviews retrieved successfully',
    data: result.reviews,
    meta: result.pagination,
  });
});

const getDriverReviewStats = catchAsync(async (req, res) => {
  const { driverId } = req.params;
  const result = await ReviewServices.getDriverReviewStats(driverId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Driver review statistics retrieved successfully',
    data: result,
  });
});

const getRiderReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await ReviewServices.getRiderReviews(
    req.user as IJwtPayload,
    Number(page),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Your reviews retrieved successfully',
    data: result.reviews,
    meta: result.pagination,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ReviewServices.deleteReview(id, req.user as IJwtPayload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

const getFeaturedReviews = catchAsync(async (req, res) => {
  const result = await ReviewServices.getFeaturedReviews();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Featured reviews retrieved successfully',
    data: result,
  });
});

export const ReviewControllers = {
  createReview,
  getReviewById,
  updateReview,
  getDriverReviews,
  getDriverReviewStats,
  getRiderReviews,
  deleteReview,
  getFeaturedReviews,
};
