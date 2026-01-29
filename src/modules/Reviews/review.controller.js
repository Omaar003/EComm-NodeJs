import { orderModel } from "../../../DB/Models/order.model.js"
import { productModel } from "../../../DB/Models/product.model.js"
import { reviewModel } from "../../../DB/Models/review.model.js"

//===============add review=================
export const addReview = async (req, res, next) => {
    const userId = req.authUser._id
    const { productId } = req.query
    //check product
    const isProductValidToBeReviewd = await orderModel.find({ userId, 'products.productId': productId, orderStatus: 'delivered' })
    if (!isProductValidToBeReviewd) {
        return next(new Error('you should buy the product first', { cause: 400 }))
    }

    const { reviewRate, reviewComment } = req.body
    const reviewObject = {
        userId,
        productId,
        reviewComment,
        reviewRate,
    }
    const reviewDb = await reviewModel.create(reviewObject)
    if (!reviewDb) {
        return next(new Error('fail to add review', { cause: 500 }))
    }

    const product = await productModel.findById(productId)
    const reviews = await reviewModel.find({ productId })
    let sumofRate = 0
    for (const review of reviews) {
        sumofRate += review.reviewRate
    }
    product.rate = sumofRate / reviews.length
    await product.save()


    res.status(201).json({ message: 'Done', reviewDb, product   })
}