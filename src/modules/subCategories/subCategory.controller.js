import slugify from "slugify"
import { categoryModel } from "../../../DB/Models/category.model.js"
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js"
import cloudinary from "../../utils/coludinaryConfigrations.js"
import { customAlphabet } from 'nanoid'
import { brandModel } from "../../../DB/Models/brand.model.js"
import { productModel } from "../../../DB/Models/product.model.js"
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)

export const createSubCategory = async (req, res, next) => {
    const { categoryId } = req.query
    const { name } = req.body
    //   console.log(categoryId);

    if (!(await categoryModel.findById(categoryId))) {
        return next(new Error('invalid category id', { cause: 400 }))
    }
    if (await subCategoryModel.findOne({ name })) {
        return next(new Error('duplicate name ', { cause: 400 }))
    }
    const slug = slugify(name, '_')

    if (!req.file) {
        return next(new Error('please upload an image ', { cause: 400 }))
    }

    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.PROJECT_FOLDER}/subCategories/${customId}`,
    })

    const subCategoriesObject = {
        name,
        slug,
        customId,
        Image: { secure_url, public_id },
        categoryId
    }
    const subCategory = await subCategoryModel.create(subCategoriesObject)
    if (!subCategory) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('try again later ', { cause: 400 }))
    }
    res.status(201).json({ message: "Added Done", subCategory })
}

//====================get all subcategories=============
export const getAllSubCategories = async (req, res, next) => {
    const subCategories = await subCategoryModel.find().populate([{
        path: 'categoryId',
        select: 'slug -_id',
    }])
    res.status(200).json({ message: "Done", subCategories })
}
//========================Update SubCategory==============
export const updateSubCategory = async (req, res, next) => {
    const { subCategoryid } = req.params
    const { name } = req.body
    const subCategory = await subCategoryModel.findById(subCategoryid)
    // console.log(subCategoryid);
    // console.log(subCategory);
    // console.log(req.params);
    // console.log(req.query);


    if (!subCategory) {
        return next(new Error('invalid Sub Category id ', { cause: 400 }))
    }

    if (name) {
        if (subCategory.name == name.toLowerCase()) {
            return next(new Error('enter different sub category name not old one ', { cause: 400 }))
        }

        if (await subCategoryModel.findOne({ name })) {
            return next(new Error('enter unique sub Category name ', { cause: 400 }))
        }
    }
    subCategory.name = name
    subCategory.slug = slugify(name, '_')

    if (req.file) {
        await cloudinary.uploader.destroy(subCategory.Image.public_id)

        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.PROJECT_FOLDER}/subCategories/${subCategory.customId}`,
        })
        subCategory.Image = { secure_url, public_id }

    }
    await subCategory.save()
    res.status(200).json({ message: "Updated Done", subCategory })

}
//=============================delete sub category======================
export const deleteSubCategory = async (req, res, next) => {
    const { subCategoryId } = req.query
    const subCategoryExists = await subCategoryModel.findByIdAndDelete(subCategoryId)
    if (!subCategoryExists) {
        return next(new Error('invalid Sub CategoryId', { cause: 400 }))
    }
    //=========== Delete from cloudinary ==============
    await cloudinary.api.delete_resources_by_prefix(
        `${process.env.PROJECT_FOLDER}/subCategories/${subCategoryExists.customId}`,
    )

    await cloudinary.api.delete_folder(
        `${process.env.PROJECT_FOLDER}/subCategories/${subCategoryExists.customId}`,
    )
    //=========== Delete from DB ==============
    const deleteRelatedBrands = await brandModel.deleteMany({ subCategoryId })
    const deleteRelatedProudcts = await productModel.deleteMany({ subCategoryId })

    if (!deleteRelatedBrands.deletedCount || !deleteRelatedProudcts.deletedCount) {
        return next(new Error('delete fail ', { cause: 400 }))

    }
    res.status(200).json({ messsage: 'Deleted Done' })

}