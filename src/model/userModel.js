const mongoose = require("mongoose");
require('mongoose-type-email');
const userSchema = new mongoose.Schema({

    title:{
        type: String,
        required: true,
        trim: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true,
        unique: true,
        match:[/^[6-9]\d{9}$/,"Please fill a valid mopbile"]
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match:[/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ]
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
        maxlength: 15
    },
    address:{
        street: String,
        city: String,
        pincode: String
    }

}, {timestamps:true})

module.exports= mongoose.model("user",userSchema)