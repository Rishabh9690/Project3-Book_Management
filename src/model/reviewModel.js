const mongoose= require("mongoose");
// const { bookModel} = require("./BookModel");

const objectid= mongoose.Schema.Types.ObjectId

const reviewschema= new mongoose.Schema({
      bookId:{
          type: objectid,
          required: true,
          ref:"bookModel"
      },
      reviewedBy:{  //name of the reviewer
          type: String,
          required: true,
          default: "Guest"
      },
      reviewedAt:{  
          type: Date
      },
      rating:{
          type: Number,
          required: true,
          min:1,
          max:5
      },
      review: {
          type: String,
          required: true,
          trim: true
        },
      isDeleted: {
          type: Boolean,
          default: false
      }
},{timestamps: true})

module.exports= mongoose.model("review",reviewschema);
