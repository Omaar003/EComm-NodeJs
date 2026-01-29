import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as cc from './coupon.controller.js'
import { validationCoreFunction } from "../../middlewares/validation.js";
import { addCouponSchema, deleteCouponSchema } from "./coupon.valiationSchemas.js";
import { isAuth } from "../../middlewares/auth.js";

const router = Router()

router.post('/',isAuth(),validationCoreFunction(addCouponSchema),asyncHandler(cc.addCoupon))
router.delete('/',isAuth(),validationCoreFunction(deleteCouponSchema),asyncHandler(cc.deleteCoupon))


export default router