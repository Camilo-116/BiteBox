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
            type: Number,
            required: true
        },
        products: {
            type: [String],
            default: []
        },
        categories: {
            type: [String],
            required: true
        },
        popularity: {
            type: Number,
            min: 0,
            default: 0
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
        versionKey: false
    }
);


export default mongoose.model('Restaurant', restaurantSchema);
