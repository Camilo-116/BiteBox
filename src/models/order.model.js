const mongoose = require('mongoose');

const productInOrderSchema = new mongoose.Schema({
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
  }, { _id: false });

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
        products: {
            type: [productInOrderSchema],
            strict: false,
            required: true
        },
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
        versionKey: false
    }
);

export default mongoose.model('Order', orderSchema);
