import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as ac from './auth.controller.js'
import { validationCoreFunction } from "../../middlewares/validation.js";

const router = Router()

router.post('/', asyncHandler(ac.signUp))
router.get('/confirm/:token', asyncHandler(ac.confirmEmail))
router.post('/login', asyncHandler(ac.logIn))
router.post('/forget', asyncHandler(ac.forgetPassword))
router.post('/reset/:token', asyncHandler(ac.resetPassword))

export default router
