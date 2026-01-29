import moment from "moment-timezone"
import { couponModel } from "../../DB/Models/coupon.model.js"

export const isCouponValid = async ({ couponCode, userId } = {}) => {
    const coupon = await couponModel.findOne({ couponCode })
    if (!coupon) {
        return {
            msg: "Invalid Coupon Code"
        }
        // return next(new Error('Invalid Coupon Code', { cause: 400 }))
    }
    // expiration
    if (coupon.couponStatus == 'Expired' || moment(new Date(coupon.toDate))
        .isBefore(moment().tz('Africa/Cairo'))) {
        return {
            msg: "Expired Coupon Code"
        }
        // return next(new Error('Expired Coupon Code', { cause: 400 }))
    }
    //==================================coupon start=================
    if (coupon.couponStatus == 'Valid' && moment()
        .isBefore(moment(new Date(coupon.fromDate)).tz('Africa/Cairo'))) {
        return {
            msg: " Coupon doesnt start yet"
        }
        // return next(new Error('Expired Coupon Code', { cause: 400 }))
    }
    // coupon not assigned
    let notAssignedUsers = []
    let MaxUsage = false
    for (const user of coupon.couponAssignedToUsers) {
        notAssignedUsers.push(user.userId.toString())
        if (user.maxUsage <= user.usageCount) {
            MaxUsage = true
        }
    }
    if (!notAssignedUsers.includes(userId.toString())) {
        return {
            notAssigned: true,
            msg: "this user not assigned for this coupon "
        }
    }

    if (MaxUsage    ) {
        return {
            msg: "exceed the max usage for this coupon "
        }
    }
    return true
}