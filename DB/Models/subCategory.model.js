import { Schema, model } from 'mongoose'

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    Image: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    customId: String,

  },
  {
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps: true,
  },
)
  subCategorySchema.virtual('Brands', {
  ref: 'Brand',
  localField: '_id',
  foreignField: 'subCategoryId',
  // justOne:true,// lw 3awz one element bs yban 
}
)

export const subCategoryModel = model('subCategory', subCategorySchema)
