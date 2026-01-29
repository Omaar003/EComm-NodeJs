import { Router } from "express";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as cc from './category.contoller.js'
import *as validtor from "./category.validationSchemas.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { subCategoryRouter } from "../subCategories/subCategory.routes.js";
import { isAuth } from "../../middlewares/auth.js";
import { systemRoles } from "../../utils/systemRoles.js";
import { categoryApiRoles } from "./category.endpoints.js";

const router = Router()
router.use('/:categoryId', subCategoryRouter)


router.post('/', isAuth(categoryApiRoles.CREATE_CATEGORY),
    multerCloudFunction(allowedExtensions.Image).single('image'),
    validationCoreFunction(validtor.createCategorySchema),
    asyncHandler(cc.createCategory))
router.put('/:categoryid', isAuth(),
    multerCloudFunction(allowedExtensions.Image).single('image'),
    validationCoreFunction(validtor.updateCategorySchema),
    asyncHandler(cc.updateCategory))

router.get('/', asyncHandler(cc.getAllCategories))
router.delete('/', isAuth(), asyncHandler(cc.deleteCategory))

//







export default router