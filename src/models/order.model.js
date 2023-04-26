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
            required: true
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
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Order', orderSchema);
