import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as oc from './order.controller.js'
import { validationCoreFunction } from "../../middlewares/validation.js";
import { isAuth } from "../../middlewares/auth.js";

const router = Router()

router.post('/', isAuth(), asyncHandler(oc.createOrder))
router.post('/cart', isAuth(), asyncHandler(oc.fromCartoOrder))
router.post('/deliver', asyncHandler(oc.deliverOrder))
export default router
