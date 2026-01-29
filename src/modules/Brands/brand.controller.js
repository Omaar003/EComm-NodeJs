import slugify from "slugify"
import { categoryModel } from "../../../DB/Models/category.model.js"
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js"

import { customAlphabet } from 'nanoid'

import { brandModel } from "../../../DB/Models/brand.model.js"
import cloudinary from "../../utils/coludinaryConfigrations.js"
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)

//=======================add brand =================
export const addBrand = async (req, res, next) => {
    const { name } = req.body
    const { categoryId, subCategoryId } = req.query
    //check categories 
    // console.log(name);

    const categoryExist = await categoryModel.findById(categoryId)
    const subCategoryExist = await subCategoryModel.findById(subCategoryId)
    if (!categoryExist || !subCategoryExist) {
        return next(new Error('inavalid categories ', { cause: 400 }))
    }
    console.log(name);

    const slug = slugify(name, {
        replacement: '_',
        lower: true,
    })

    if (!req.file) {
        return next(new Error('please upload your logo ', { cause: 400 }))

    }
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brand/${customId}`,
        },
    )
    const brandObject = {
        name,
        slug,
        logo: { secure_url, public_id },
        categoryId,
        subCategoryId,
        customId,
    }
    const dbBrand = await brandModel.create(brandObject)
    if (!dbBrand) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('try again later', { cause: 400 }))
    }
    res.status(201).json({ message: "Created Done", dbBrand })
}
