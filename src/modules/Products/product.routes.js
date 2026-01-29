
import { Router } from "express";
import * as pc from './product.controller.js'
import { validationCoreFunction } from "../../middlewares/validation.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import * as validtor from './product.validationSchemas.js'
const router = Router()



router.post('/', multerCloudFunction(allowedExtensions.Image).array('image', 3), asyncHandler(pc.addProduct))
router.put('/', multerCloudFunction(allowedExtensions.Image).array('image', 2), asyncHandler(pc.updateProduct))
router.get('/', asyncHandler(pc.getAllProducts))
router.get('/title', asyncHandler(pc.getProductByTitle))
router.get('/api', asyncHandler(pc.listProducts))



export default router