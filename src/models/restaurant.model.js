const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            minlength: 3,
            index: true,
            required: true
        },
        address: {
            type: String,
            trim: true,
            minlength: 3,
            required: true
        },
        products: {
            type: [String],
            required: true
        },
        categories: {
            type: [String],
            required: true
        },
        popularity: {
            type: Number,
            min: 0,
            required: true
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


export default mongoose.model('Restaurant', restaurantSchema);
