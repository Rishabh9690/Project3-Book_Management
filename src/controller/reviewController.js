const bookModel = require("../model/bookModel");
const reviewModel= require("../model/reviewModel");

const isValid= function(value)
{
    if(typeof (value) ==="undefined"  || value=== "null") return false;
    if(typeof (value)==="string" && value.trim().length==0) return false;

    return true;
}

const isValidObjectId= function(value)
{
    return /^[0-9a-fA-F]{24}$/.test(value)
}

const isValidRequestBody= function(value)
{
    return Object.keys(value).length>0;
}

const review= async function(req, res)
{
    try
    {
        const data= req.body;
        const paramsBookId= req.params.bookId;

        if(!isValidRequestBody(data)) return res.status(400).send({status:false, message: "Please provide some data..!!"});

        const bookId= data.bookId

        if(!isValid(bookId)) return res.status(400).send({status: false, message: "Please provide the BookId..!!"}); //(!bookId)?

        if(!isValidObjectId(bookId)) return res.status(400).send({status: false, message: "BookId is not valid..!!"});

        if(!isValid(paramsBookId)) return res.status(400).send({status: false, message: "Please provide the bookId in path params..!!"});

        if(!isValidObjectId(paramsBookId)) return res.status(400).send({status: false, message: "Please provide a valid BookId..!!"});

        if(bookId!== paramsBookId) return res.status(400).send({status: false, message: "Please provide the same BookId in both parmas and body..!!"});

        const findingBookId= await bookModel.findOne({_id: bookId, isDeleted: false});
        if(!findingBookId) return res.status(400).send({status: false, message: "No book found with this Id..!!"});

        const {reviewedBy, rating, review} =data

        if(!reviewedBy) return res.status(400).send({status: false, message: "Name is needed..!!"})
        if(!isValid(reviewedBy)) return res.status(400).send({status: false, message: "Please provide the name of the reviewer..!!"});
        const isReviewRepeat= await reviewModel.findOne({bookId:bookId, reviewedBy: reviewedBy, isDeleted: false});
        if(isReviewRepeat) return res.status(400).send({staus: false, message: "This person as already reviewed this book..!!"});

        if(!review) return res.status(400).send({status: false, message: "review in needed..!!"});
        
        if(!isValid(review)) return res.status(400).send({staus: false, message: "Please write some review..!!"});
        
        if(!rating) return res.status(400).send({status: false, message: "Please provide the rating..!!"});
        
        if(rating<1 || rating>5) return res.status(400).send({status: false, message: "Rating must be from 1 to 5..!!"});  
        
        reviewedAt= new Date();

        const updatingReview= await bookModel.findOneAndUpdate({_id: bookId}, {$inc: { reviews: +1}} ,{new: true})

        const creatingReview= await reviewModel.create({...data,reviewedAt});

        const allReviews= await reviewModel.find({bookId: bookId, isDeleted: false}).select({_id:1, bookId:1, reviewedBy:1, reviewedAt:1, review:1, rating:1});

        return res.status(201).send({status: true, message: "Review created..!!",  reviews: allReviews});
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({status: false, message: err.message});
    }
}


const isReviewModified= async function(req,res)
{
    try
    {
        const data= req.body

        if(!isValidRequestBody(data)) return res.status(400).send({status: false, message: "Please provide some data..!!"});

        const bookId= req.params.bookId  
        const reviewId= req.params.reviewId   

        if(!isValid(bookId)) return res.status(400).send({status: false, message: "Please provide the bookId..!!"});
        if(!isValidObjectId(bookId)) return res.status(400).send({status: false, message: "Please provide a valid BookId..!!"});
        
        const searchingForBook= await bookModel.findById({_id: bookId, isDeleted: false}).select({bookId:1, title:1, ISBN:1, category:1, subcategory:1, excerpt:1, reveiws:1});
        if(!searchingForBook) return res.status(400).send({status: false, message: "No such Id is present..!!"});

        if(!isValid(reviewId)) return res.status(400).send({status: false, message: "Please provide the reviewId..!!"});
        if(!isValidObjectId(reviewId)) return res.status(400).send({status: false,message: "Please provide a valid reviewId..!!"})

        const searchingForReview= await reviewModel.findById({_id: reviewId, isDeleted: false});
        if(!searchingForReview) return res.status(400).send({status: false, message: "No review found to be updated..!!"});

        if(searchingForReview.bookId !=bookId) return res.status(400).send({status: false, message: "BookId and Reivew are not of same review..!!"});

        const {reviewedBy, review, rating}= data

        if(!isValid(reviewedBy)) return res.staus(400).send({status: false, message: "Please enter the reviewer's name..!!"});

        if(!isValid(review)) return res.status(400).send({status: false, message: "Please enter the updated review..!!"});

        if(!rating) return res.status(400).send({status: false, message: "Please provide the ratings..!!"});

        if(rating<1 || rating>5) return res.status(400).send({status: false, message: "The rating must be between 1 to 5..!!"});

        const updatedreview= await reviewModel.findOneAndUpdate({_id: reviewId, bookId: bookId, isDeleted: false}, {$set:{reviewedBy: reviewedBy, rating: rating, review: review}}, {new: true});
        return res.status(200).send({status: true, message: "review updated..!!", data: {searchingForBook, review: updatedreview}});
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({status: false, message: err.message});
    }
}


const isReviewDeleted= async function(req, res)
{
    try
    {
        const reviewId= req.params.reviewId;
        const bookId= req.params.bookId;

        if(!isValid(reviewId)) return res.status(400).send({status: false, message: "Please provide the reviewId..!!"});

        if(!isValidObjectId(reviewId)) return res.status(400).send({status: false, message: "ReviewId is not valid..!!"});

        if(!isValid(bookId)) return res.status(400).send({status: false, message: "Please provide the bookId..!!"});

        if(!isValidObjectId(bookId)) return res.status(400).send({status: false, message: "BookId is not valid..!!"});

        const findingDataByBookId= await bookModel.findById({_id: bookId, isDeleted: false});
        if(!findingDataByBookId) return res.status(400).send({status:false, message: "No book found..!!"});

        const findingReview= await reviewModel.findById({_id: reviewId, bookId: bookId});
        if(!findingReview) return res.status(400).send({status: false, message: "No review found with this reviewId..!!"});
 
        if(findingReview.isDeleted==true) return res.status(400).send({status: false, message: "Review already deleted..!!"});

        else
        {   
        const deletingReview= await reviewModel.findOneAndUpdate({_id: reviewId, bookId: bookId}, {$set:{isDeleted: true}}, {new: true});

        const removingReview= await bookModel.findOneAndUpdate({_id: bookId}, {$inc:{reviews:-1}});

        return res.status(200).send({status: true, message: "Review deleted..!!", review:deletingReview});
        }
        
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({status: false, message: err.message});
    }
}

module.exports.review= review;
module.exports.isReviewModified= isReviewModified;
module.exports.isReviewDeleted= isReviewDeleted