
import { Router } from "express";
import { isAuth } from "../../middlewares/auth.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as rc from './review.controller.js'
import * as validators from './review.validationSchema.js'
import reviewApidsRoles from './review.endPoints.js'
const router = Router()


router.post('/', isAuth(reviewApidsRoles.ADD_REVIEW), validationCoreFunction(validators.addReviewSchema), asyncHandler(rc.addReview))

export default router
