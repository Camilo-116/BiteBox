import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            index: true,
            required: true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
        price: {
            type: Number,
            min: 0,
            required: true
        },
        category: {
            type: String,
            trim: true,
            required: true
        },
        restaurant: {
            type: String,
            default: ""
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        versionKey: false
    }
);

export default mongoose.model('Product', productSchema);
