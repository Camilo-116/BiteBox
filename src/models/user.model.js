const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            firstName: {
                type: String,
                trim: true,
                minlength: 2,
                required: true
            },
            middleNames: {
                type: String,
                trim: true,
                minlength: 2
            },
            lastNames: {
                type: String,
                trim: true,
                minlength: 2,
                required: true
            }
        },
        email: {
            type: String,
            required: true,
            index: true,
            match: /.+@.+\..+/,
            unique: true
        },
        password: {
            type: String,
            minlength: 6,
            required: true
        },
        phone: {
            type: String,
            trim: true,
            minlength: 6,
            match: /[0-9]+/,
            required: true
        },
        address: {
            type: String,
            trim: true,
            minlength: 3,
            required: true
        },
        userType: {
            type: String,
            enum: ['client', 'courier', 'admin'],
            default: 'client'
        },
        restaurants: {
            type: [String]
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

export default mongoose.model('User', userSchema);
