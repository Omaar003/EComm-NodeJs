import { Router } from 'express'
import { multerFunction } from '../../services/multerLocally.js'
import { multerCloudFunction } from '../../services/multerCloud.js'
import { allowedExtensions } from '../../utils/allowedExtensions.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import * as bc from './brand.controller.js'
const router = Router()

router.post('/',
    multerCloudFunction(allowedExtensions.Image).single('logo')
    , asyncHandler(bc.addBrand)
)
export default router
