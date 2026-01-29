import { model, Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        unique:true,
        lowercase:true,
        required:true,
    },
    slug: {
        type: String,
        unique:true,
        lowercase:true,
        required:true,
    },
    Image:{
        secure_url:{
            type:String,
            required:true,
        },
        public_id:{
            type: String,
            required:true,
        },
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true 
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true 
    },
    customId:{
        type: String,
    }
},
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

categorySchema.virtual('subCategories', {
  ref: 'subCategory',
  localField: '_id',
  foreignField: 'categoryId',
  // justOne:true,// lw 3awz one element bs yban 
})

export const categoryModel = model('Category', categorySchema)