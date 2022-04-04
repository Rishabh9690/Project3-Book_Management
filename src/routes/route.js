const express = require('express');
const router = express.Router();

const userController=require("../controller/userController");
const bookController= require("../controller/bookController");
const reviewController= require("../controller/reviewController");
const middleWare= require("../middleWare/Auth");


router.post("/functionup/register",userController.createUser )

router.post("/functionup/login", userController.userLogin )

router.post("/functionup/books", middleWare.authenticate,bookController.createBooks)

router.get("/functionup/get/books", middleWare.authenticate,bookController.getBooksInfo)

router.get("/functionup/books/:bookId", middleWare.authenticate,bookController.getBookInfoById)

router.put("/functionup/books/:bookId", middleWare.authenticate, middleWare.authorisation,bookController.isModified)

router.delete("/functionup/book/:bookId", middleWare.authenticate, middleWare.authorisation,bookController.deletingBook)

router.post("/functionup/books/:bookId/review", reviewController.review)

router.put("/functionUp/books/:bookId/review/:reviewId", reviewController.isReviewModified)

router.delete("/functionup/books/:bookId/review/:reviewId", reviewController.isReviewDeleted)


module.exports = router;