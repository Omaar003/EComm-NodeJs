import slugify from "slugify"
import { brandModel } from "../../../DB/Models/brand.model.js"
import { categoryModel } from "../../../DB/Models/category.model.js"
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js"
import { customAlphabet } from 'nanoid'
import { productModel } from "../../../DB/Models/product.model.js"
import cloudinary from "../../utils/coludinaryConfigrations.js"
import { paginationFunction } from "../../utils/pagination.js"
import { ApiFeatures } from "../../utils/apiFeatures.js"
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)

export const addProduct = async (req, res, next) => {
    const {
        title,
        desc,
        price,
        appliedDiscout,
        colors,
        sizes,
        stock,
    } = req.body
    //   const userId = req.authUser._id

    const { categoryId, subCategoryId, brandId } = req.query

    const subCategoryExist = await subCategoryModel.findById(subCategoryId)
    if (!subCategoryExist) {
        return next(new Error('inavalid subcategory ', { cause: 400 }))
    }

    const categoryExist = await categoryModel.findById(categoryId)
    if (!categoryExist) {
        return next(new Error('inavalid category ', { cause: 400 }))
    }

    const brandExist = await brandModel.findById(brandId)
    if (!brandExist) {
        return next(new Error('inavalid brand ', { cause: 400 }))
    }
    const slug = slugify(title, {
        replacement: '_',
    })
    // if (appliedDiscout) {
    const priceAfterDiscount = price - (price * (appliedDiscout || 0) / 100)
    // }

    if (!req.files) {
        return next(new Error('please upload a Product images ', { cause: 400 }))
    }
    const customId = nanoid()
    const Images = []
    const PublicIds = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
            folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brand/${brandExist.customId}/product/${customId}`,
        })
        Images.push({ secure_url, public_id })
        PublicIds.push(public_id)
    }
    req.imagePath = `${process.env.PROJECT_FOLDER}/Categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brand/${brandExist.customId}/product/${customId}`

    const productObject = {
        title,
        desc,
        price,
        slug,
        appliedDiscout,
        priceAfterDiscount,
        colors,
        sizes,
        stock,
        categoryId,
        subCategoryId,
        brandId,
        Images,
        customId,
        // createdBy: userId,

    }
    const product = await productModel.create(productObject)
    if (!product) {
        await cloudinary.api.delete_resources(PublicIds)
        return next(new Error('try again later ', { cause: 400 }))
    }
    res.status(200).json({ message: "Created Done", product })
}
//================================= update product ===========================
export const updateProduct = async (req, res, next) => {
    const { title, desc, price, appliedDiscount, colors, sizes, stock } = req.body

    const { productId, categoryId, subCategoryId, brandId } = req.query

    // check productId
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error('invalid product id', { cause: 400 }))
    }

    const subCategoryExists = await subCategoryModel.findById(
        subCategoryId || product.subCategoryId,
    )
    if (subCategoryId) {
        // if (!subCategoryExists) {
        //   return next(new Error('invalid subcategories', { cause: 400 }))
        // }
        product.subCategoryId = subCategoryId
    }
    const categoryExists = await categoryModel.findById(
        categoryId || product.categoryId,
    )
    if (categoryId) {
        if (!categoryExists) {
            return next(new Error('invalid categories', { cause: 400 }))
        }
        product.categoryId = categoryId
    }

    const brandExists = await brandModel.findById(brandId || product.brandId)
    if (brandId) {
        if (!brandExists) {
            return next(new Error('invalid brand', { cause: 400 }))
        }
        product.brandId = brandId
    }

    if (appliedDiscount && price) {
        const priceAfterDiscount = price * (1 - (appliedDiscount || 0) / 100)
        product.priceAfterDiscount = priceAfterDiscount
        product.price = price
        product.appliedDiscount = appliedDiscount
    } else if (price) {
        const priceAfterDiscount =
            price * (1 - (product.appliedDiscount || 0) / 100)
        product.priceAfterDiscount = priceAfterDiscount
        product.price = price
    } else if (appliedDiscount) {
        const priceAfterDiscount =
            product.price * (1 - (appliedDiscount || 0) / 100)
        product.priceAfterDiscount = priceAfterDiscount
        product.appliedDiscount = appliedDiscount
    }

    // handle images
    if (req.files?.length) {
        const categoryFolder = (categoryExists || await categoryModel.findById(product.categoryId))?.customId
        const subCategoryFolder = (subCategoryExists || await subCategoryModel.findById(product.subCategoryId))?.customId
        const brandFolder = (brandExists || await brandModel.findById(product.brandId))?.customId

        let ImageArr = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryFolder}/subCategories/${subCategoryFolder}/Brands/${brandFolder}/Products/${product.customId}`,
            })
            ImageArr.push({ secure_url, public_id })
        }

        // delete old images
        const public_ids = product.Images.map(img => img.public_id)
        if (public_ids.length) {
            await cloudinary.api.delete_resources(public_ids)
        }

        product.Images = ImageArr
    }

    if (title) {
        product.title = title
        product.slug = slugify(title, '-')
    }
    if (desc) product.desc = desc
    if (colors) product.colors = colors
    if (sizes) product.sizes = sizes
    if (stock) product.stock = stock

    await product.save()
    res.status(200).json({ message: 'Done', product })
}
//===================get All Products================
export const getAllProducts = async (req, res, next) => {

    const { page, size } = req.query
    const { limit, skip } = paginationFunction({ page, size })
    const products = await productModel.find().limit(limit).skip(skip).populate([{ path: 'Reviews' }])
    res.status(200).json({ message: "Done", products })
}
//===================get Products BY name================
export const getProductByTitle = async (req, res, next) => {

    const { searchKey, page, size } = req.query
    const { limit, skip } = paginationFinction({ page, size })
    const products = await productModel.find(
        {
            //        title: { $regex: searchKey, $options: 'i' } // de tare2t 7al 
            $or: [
                { title: { $regex: searchKey, $options: 'i' } },// ba3ml search b goz2 mn elklma msh kolha 
                { desc: { $regex: searchKey, $options: 'i' } }
            ]
        }
    ).limit(limit).skip(skip)
    res.status(200).json({ message: "Done", products })
}
//=======================api featuers==========
export const listProducts = async (req, res, next) => {
    // //================sort ============
    // const { sort } = req.query
    // const products = await productModel
    // .find()
    // .sort(req.query.sort.replace(',', ' '))
    //  res.status(200).json({ message: 'Done', products })
    //========================select=========================
    // const { select } = req.query
    // console.log(req.query.select.replaceAll(',', ' '))
    // const products = await productModel
    //     .find()
    //     .select(req.query.select.replaceAll(',', ' '))
    //  res.status(200).json({ message: 'Done', products })
    //==================search================================
    // const products = await productModel.find({
    //     $or: [
    //         { title: { $regex: req.query.search, $options: 'i' } },
    //         { desc: { $regex: req.query.search, $options: 'i' } },
    //     ],
    // })
    //  res.status(200).json({ message: 'Done', products })
    //===================== filters =================
    // const queryInstance = { ...req.query }
    // const execuldeKeysArr = ['page', 'size', 'sort', 'select', 'search']
    // execuldeKeysArr.forEach((key) => delete queryInstance[key])
    // const queryString = JSON.parse(
    //   JSON.stringify(queryInstance).replace(
    //     /gt|gte|lt|lte|in|nin|eq|neq|regex/g,
    //     (match) => `$${match}`,
    //   ),
    // )
    //  const products = await productModel.find(queryString).sort(queryInstance.sort)
    //  res.status(200).json({ message: 'Done', products })
    const ApiFeaturesInstance = new ApiFeatures(productModel.find({}), req.query)
        .pagination()
        .filters()
        .sort()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({ message: 'Done', products })
}

