import { cartModel } from "../../../DB/Models/cart.model.js"
import { couponModel } from "../../../DB/Models/coupon.model.js"
import { orderModel } from "../../../DB/Models/order.model.js"
import { productModel } from "../../../DB/Models/product.model.js"
import { isCouponValid } from "../../utils/couponValidation.js"

// ===========================create Order================
export const createOrder = async (req, res, next) => {
    const userId = req.authUser._id
    const {
        productId,
        quantity,
        address,
        phoneNumbers,
        paymentMethod,
        couponCode,
    } = req.body
    //=================coupon check==================
    if (couponCode) {
        const coupon = await couponModel.findOne({ couponCode }).select('isPercentage isFixedAmount couponAmount couponAssignedToUsers')

        console.time('coupon-check')
        const isCouponValidResult = await isCouponValid({ couponCode, userId })
        console.timeEnd('coupon-check')

        if (isCouponValidResult !== true) {
            return isCouponValidResult
        }
        req.coupon = coupon
    }
    //=====================products check===============
    const products = []
    const isProductValid = await productModel.findOne({ _id: productId, stock: { $gte: quantity } })
    if (!isProductValid) {
        return next(new Error('invalid product', { cause: 400 }))
    }
    const productObject = {
        productId,
        quantity,
        title: isProductValid.title,
        price: isProductValid.priceAfterDiscount,
        finalPrice: isProductValid.priceAfterDiscount * quantity,
    }
    products.push(productObject)
    //===============subtotal===============
    const subTotal = productObject.finalPrice

    let paidAmount = 0
    if (req.coupon?.isPercentage) {
        paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
    }
    else if (req.coupon?.isFixedAmount) {
        paidAmount = subTotal - req.coupon.couponAmount

    }
    else {
        paidAmount = subTotal
    }
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

    const orderObject = {
        userId,
        products,
        address,
        phoneNumbers,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
        couponId: req.coupon?._id
    }

    const orderDb = await orderModel.create(orderObject)

    if (orderDb) {
        //increase usageCount for coupon usage
        if (req.coupon) {
            for (const user of req.coupon.couponAssignedToUsers) {
                if (user.userId.toString() == userId.toString()) {
                    user.usageCount += 1
                }

            }
            await req.coupon.save()
        }
        //decrease product stock
        await productModel.findOneAndUpdate({ _id: productId }, {
            $inc: { stock: -parseInt(quantity) }
        })

        //todo : remove product from usercart if exist
        return res.status(201).json({ message: "Done", orderDb })
    }
    return next(new Error('fail to create your order', { cause: 400 }))
}
//=====================from cart to order=====================
export const fromCartoOrder = async (req, res, next) => {
    const userId = req.authUser._id
    const { cartId } = req.query
    const {
        address,
        phoneNumbers,
        paymentMethod,
        couponCode,
    } = req.body

    const cart = await cartModel.findById(cartId)
    if (!cart || !cart.products.length) {
        return next(new Error('Please fill your cart ', { cause: 400 }))
    }
    //=================coupon check==================
    if (couponCode) {
        const coupon = await couponModel.findOne({ couponCode }).select('isPercentage isFixedAmount couponAmount couponAssignedToUsers')
        const isCouponValidResult = await isCouponValid({ couponCode, userId, next })
        if (isCouponValidResult !== true) {
            return next(new Error(isCouponValid.msg, { cause: 400 }))
        }
        req.coupon = coupon
    }

    let subTotal = cart.subTotal
    let paidAmount = 0
    if (req.coupon?.isPercentage) {
        paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
    }
    else if (req.coupon?.isFixedAmount) {
        paidAmount = subTotal - req.coupon.couponAmount

    }
    else {
        paidAmount = subTotal
    }
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

    let orderProducts = []
    for (const product of cart.products) {
        const productExist = await productModel.findById(product.productId)
        orderProducts.push({
            productId: product.productId,
            quantity: product.quantity,
            title: productExist.title,
            price: productExist.priceAfterDiscount,
            finalPrice: productExist.priceAfterDiscount * product.quantity
        })
    }
    const orderObject = {
        userId,
        products: orderProducts,
        address,
        phoneNumbers,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
        couponId: req.coupon?._id
    }

    const orderDb = await orderModel.create(orderObject)

    if (orderDb) {
        //increase usageCount for coupon usage
        if (req.coupon) {
            for (const user of req.coupon.couponAssignedToUsers) {
                if (user.userId.toString() == userId.toString()) {
                    user.usageCount += 1
                }

            }
            await req.coupon.save()
        }
        //decrease product stock
        for (const product of cart.products) {
            await productModel.findOneAndUpdate({ _id: product.productId }, {
                $inc: { stock: -parseInt(product.quantity) }
            })
        }

        //todo : remove product from usercart if exist
        cart.products = []
        await cart.save()

        res.status(201).json({ message: "Done", orderDb, cart })
    }
    return next(new Error('fail to create your order', { cause: 400 }))

}

//======================order delivered===========

export const deliverOrder = async (req, res, next) => {
    const { orderId } = req.body
    const order = await orderModel.findByIdAndUpdate({
        _id: orderId,
        orderStatus: { $nin: ['deleivered', 'canceled', 'rejected', 'pending'] }
    },
        { orderStatus: 'deleivered' }
        ,
        { new: true }
    )
    if (!order) {
        return next(new Error('cannot deleiver this order ', { cause: 400 }))
    }
    res.status(200).json({ message: 'Done', order })
}