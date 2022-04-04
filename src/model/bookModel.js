const mongoose = require('mongoose');
const objectid = mongoose.Schema.Types.ObjectId

const bookschema = new mongoose.Schema( {
    title: {
        type:String,
        required: true,
        unique:true,
        trim: true
    },
    excerpt: {
        type: String,
        required: true, 
        trim: true
    }, 
    userId: {
        type: objectid,
        required: true, 
        ref:"user",
        trim: true
    },
    ISBN: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type:String,
        required: true
    },
    reviews: {
        type: Number, 
        default: false
    },
    deletedAt: {
        type: Date
    }, 
    isDeleted: {
        type: Boolean, 
        default: false
    },
    releasedAt: {
        type: Date,
        required: true, 
        default: Date.now()
     
    },
    createdAt: Date,
    updatedAt : Date

},{timestamps:true});

module.exports = mongoose.model("book", bookschema);