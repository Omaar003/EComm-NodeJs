
import { Router } from "express";
import * as sc from './subCategory.controller.js'
import { validationCoreFunction } from "../../middlewares/validation.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import * as validtor from './subCategory.validationSchemas.js'
const router = Router({ mergeParams: true })



router.post('/',
    multerCloudFunction(allowedExtensions.Image).single('image'),
    validationCoreFunction(validtor.createsubCategorySchema),
    asyncHandler(sc.createSubCategory))
router.get('/', asyncHandler(sc.getAllSubCategories))
router.put('/:subCategoryid',
    multerCloudFunction(allowedExtensions.Image).single('image'),
    validationCoreFunction(validtor.createsubCategorySchema),
    asyncHandler(sc.updateSubCategory))
router.delete('/', asyncHandler(sc.deleteSubCategory))





export const subCategoryRouter = router
export default router