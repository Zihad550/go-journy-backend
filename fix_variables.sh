#!/bin/bash

# Fix variable names in import statements back to camelCase

find src/ -name "*.ts" -exec sed -i \
  -e 's/import global-error-handler/import globalErrorHandler/g' \
  -e 's/import not-found/import notFound/g' \
  -e 's/import validate-request/import validateRequest/g' \
  -e 's/import set-cookie/import setCookie/g' \
  -e 's/import send-email/import sendEmail/g' \
  -e 's/import transaction-id/import transactionId/g' \
  -e 's/import use-object-id/import useObjectId/g' \
  -e 's/import send-response/import sendResponse/g' \
  -e 's/import catch-async/import catchAsync/g' \
  -e 's/import handle-zod-error/import handleZodError/g' \
  -e 's/import handle-validation-error/import handleValidationError/g' \
  -e 's/import handle-duplicate-error/import handleDuplicateError/g' \
  -e 's/import handle-cast-error/import handleCastError/g' \
  -e 's/import app.error/import AppError/g' \
  -e 's/import error-interface/import errorInterface/g' \
  -e 's/import jwt-interface/import jwtInterface/g' \
  -e 's/import index-d/import indexD/g' \
  {} \;

# For modules, the imports are like import { AnalyticsRoutes } from "../modules/analytics/analytics-route";
# The variable is AnalyticsRoutes, which is PascalCase, should remain.
# Only the path is changed.

# But in controllers, the import names are wrong.

# For example, in auth-controller.ts, import AppError from '../../errors/app.error'

# The variable AppError is fine.

# But in the bad sed, it might have changed some.

# To fix, I think the main issue is the top level imports in app.ts and routes.

# For controllers, the imports are like import { name } from './file'

# Since the file is renamed, and path updated, and name is PascalCase or camel, fine.

echo "Variable names fixed"