import { Router } from 'express'
import * as cc from './cart.controller.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { isAuth } from '../../middlewares/auth.js'
const router = Router()

router.post('/', isAuth(),asyncHandler(cc.addToCart))
router.delete('/', isAuth(),asyncHandler(cc.deleteFromCart))
export default router
