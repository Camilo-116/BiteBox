const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        courier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        restaurant: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Created', 'Sent', 'Accepted', 'Received', 'Arrived', 'Finished'],
            default: 'Created'
        },
        createdAt: {
            type: Date,
            immutable: true,
            default: Date.now
        },
        products: [{
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            total: {
                type: Number,
                required: true
            }
        }],
        total: {
            type: Number,
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

export default mongoose.model('Order', orderSchema);
