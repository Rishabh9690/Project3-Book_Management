const jwt = require("jsonwebtoken");
const bookModel = require("../model/bookModel");


const authenticate = function (req, res, next) {
    try
    {
        let token = req.headers["x-api-key"];
        if (!token) return res.send({ status: false, msg: "token must be present..!!" });
    
        let decodedtoken = jwt.verify(token, "SecurityCode");
        if (!decodedtoken) return res.send({ status: false, msg: "Token is Invalid..!!" });
        next();
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({status: false, message: err.message});    
    }
}


const authorisation = async function (req, res, next) {

    try
    {
        const data = req.params.bookId
    
        if(!data) return res.status(400).send({status: false, message: "BookId is missing..!!"})
        const findBook = await bookModel.findById(data)
        if (!findBook) return res.status(400).send("Book Id is not valid..!!")
    
        const userid = findBook.userid
        let token = req.headers["x-api-key"];
        if (!token) return res.status(400).send({ status: false, msg: "token must be present..!!" })
    
        let decodedtoken = jwt.verify(token, "SecurityCode")
        let userlogin = decodedtoken.userid
    
        if (userid != userlogin) { return res.status(400).send({ status: false, msg: "user not allowed to modify another user book..!!" }) }
    
        next();
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({status: false, message: err.message});
    }
}




module.exports.authenticate = authenticate
module.exports.authorisation = authorisation