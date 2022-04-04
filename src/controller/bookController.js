const { send } = require("express/lib/response");
const bookModel= require("../model/bookModel");
const reviewModel= require("../model/reviewModel");
const { findById, find } = require("../model/userModel");
const userModel= require("../model/userModel");
const mongoose= require("mongoose");
const { is } = require("express/lib/request");
// const { route, all } = require("../routes/route");

const isValid= function(value)
{
    if(typeof (value) ==="undefined"  || value=== "null") return false;
    if(typeof (value)==="string" && value.trim().length==0) return false;

    return true;
}

const isValidObjectId = function(value){
    return /^[0-9a-fA-F]{24}$/.test(value)
}

const isValidRequestBody =function(value)
{
    return Object.keys(value).length>0;
}

const isValidDate= function(value)
{
    return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(value);
}

const createBooks= async function(req, res)
{
    try
    {
        const data= req.body
        if(!isValidRequestBody(data)) return res.status(400).send({status:false, message: "Please provide the data..!!"})

        const userId= data.userId   //isValid(userid)=?

        if(!isValid(userId)) return res.status(400).send({status: false, message: "UserId is required..!!"});
        if(!isValidObjectId(userId)) return res.status(400).send({status: false, message: "Id is not valid..!!"});

        const {title,excerpt,ISBN,category,subcategory, releasedAt} =data    

        if(!isValid(title)) return res.status(400).send({status:false, message: "Title is required..!!"});
        const isTitleUnique= await bookModel.findOne({title:title});
        if(isTitleUnique) return res.status(400).send({status:false, message:"Title is already in the database..!!"});

        if(!isValid(excerpt)) return res.status(400).send({status:false, message:"Excerpt is required..!!"});

        if(!isValid(ISBN)) return res.status(400).send({status: false, message: "ISBN is required..!!"});
        const isIsbnUnique= await bookModel.findOne({ISBN:ISBN});
        if(isIsbnUnique) return res.status(400).send({status:false, message: "ISBn is already in the database..!!"});

        if(!isValid(category)) return res.status(400).send({status:false, message: "Category is required..!!"});

        if(!isValid(subcategory)) return res.status(400).send({status: false, message: "Subcategory is requried..!!"});

        if(!isValid(releasedAt)) return res.status(400).send({status: false, message: "Released date is requried..!!"});
        if(!isValidDate(releasedAt)) return res.status(400).send({status: false, message: "Please provide the date in YYYY-MM-DD format..!!"});

        const bookCreate= await bookModel.create(data)
        res.status(201).send({status: true, message: bookCreate});

    }
    catch(err)
    {
        console.log(err)
        res.status(500).send({status: false, message :err.message});
    }

}

const getBooksInfo= async function(req, res)
{
    try
    {
        const data= req.query   //Data can be category, id, subcatory

        if(isValidRequestBody(data))
        {
        const bookData= await bookModel.find({$and :[data,{isDeleted:false}]}).select({_id:1, title:1, excerpt: 1, userId:1, category:1, releasedAt:1, reviews:1}).sort({title:1});

        if(!bookData) return res.statu(404).send({status: false, message: "No data found with this Id..!!"});
        res.status(200).send({status: true, data: bookData});
        }
        else
        {
        const bookDataNotDeleted= await bookModel.find({isDeleted: false}).select({_id:1, title:1, excerpt: 1, userId:1, category:1, releasedAt:1, reviewsfields:1}).sort({title:1});
        res.status(200).send({status: true, data: bookDataNotDeleted});
        }

    }
    catch(err)
    {
        console.log(err)
        res.status(500).send({status: false, message: err.message});
    }
}

const getBookInfoById= async function(req, res)
{
    try
    {
        const bookId= req.params.bookId

        if(!isValid(bookId)) return res.status(400).send({status: false, message: "Please enter the  Id..!!"});
        if(!isValidObjectId(bookId)) return res.status(400).send({status: false, message: "Please enter a valid Id..!!"});

        const findData= await bookModel.findOne({_id: bookId, isDeleted: false});

        if(!findData) return res.status(404).send({status:false, message: "No data found..!!"});

        const review= await reviewModel.find({bookId: bookId, isDeleted: false}).select({_id:1, bookId:1, reviewedBy:1,  reviewedAt:1,  rating:1, review:1});

       return res.status(200).send({status: true, data: {findData,reviewData: review}});

    }
    catch(err)
    {
        console.log(err)
        res.status(400).send({status: false, message: err.message})
    }
}

const isModified = async function(req, res)
{
    try
    {
        const data= req.body
        const bookId=req.params.bookId
        
        if(!isValid(data)) return res.status(400).send({status: false, Message: "Please provide the data to update..!!"});

        if(!isValid(bookId)) return res.status(400).send({status: false, message: "Please provide bookId..!!"});
        if(!isValidObjectId(bookId)) return res.status(400).send({status: false, Message: "Please provide the valid Id..!!"});

        const findData= await bookModel.findById({_id:bookId, isDeleted: false})

        if(!findData) return res.status(404).send({status: false, message: "Book is not present..!!"});

        const isTitleUnique= await bookModel.findOne({title: data.title, isDeleted: false});
        if(isTitleUnique && isTitleUnique._id!== bookId) return res.status(400).send({status: false, message: "This title is aready present is the DataBase..!!"});

        const isISBNUnique= await bookModel.findOne({ISBN: data.ISBN, isDeleted: false});
        if(isISBNUnique && isISBNUnique._id!== bookId) return res.status(400).send({status: false, message: "This ISBN is already present in the DataBase..!!"});

        // const updatingData= await bookModel.findByIdAndUpdate({_id:bookId, userId: userId}, {$set:{title: data.title, excerpt: data.excerpt, releasedAt: data.releasedAt , ISBN: data.ISBN}},{new : true});

        const updatingData= await bookModel.findByIdAndUpdate({_id:bookId, userId: findData.userId}, {...data},{new : true});
        res.status(200).send({status: true, data: updatingData});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({status: false, message: err.message});
    }
}

const deletingBook= async function(req, res)
{
    try
    {
        const bookId=req.params.bookId

        if(!isValid(bookId)) return res.status(400).send({status: false, message: "Please provide the Id..!!"});

        if(!isValidObjectId(bookId)) return res.status(400).send({status:false, message: "Please provide the valid Id..!!"});

        const findDeletingData= await bookModel.findById({_id: bookId});

        if(!findDeletingData) return  res.status(400).send({status:false, message: "Data not found..!!"});
        else 
        {
            if(findDeletingData.isDeleted==true) return res.status(400).send({status: false, message: "Already Deleted..!!"});

            const deletingFile= await bookModel.findOneAndUpdate({_id:bookId}, {$set: {isDeleted:true, deletedAt: new Date()}}, {new: true})
            return res.status(200).send({status: true, message: "Book is Deleted..!!", data: deletingFile});
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({status: false, message: err.message});
    }
}


module.exports.createBooks= createBooks
module.exports.getBooksInfo= getBooksInfo
module.exports.getBookInfoById= getBookInfoById
module.exports.isModified= isModified
module.exports.deletingBook= deletingBook