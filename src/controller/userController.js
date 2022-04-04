// const validation= require("validator-validation")
const userModel= require("../model/userModel");
const jwt= require("jsonwebtoken")

const isValid= function(value)
{
    if(typeof (value) ==="undefined"  || value=== "null") return false;
    if(typeof (value)==="string" && value.trim().length==0) return false;

    return true;
}

const isValidRequestBody =function(value)
{
    return Object.keys(value).length>0;
}


const isValidPhoneNumber=function(value)
{
    if( /^[6-9]\d{9}$/.test(value)) return true;       //Regex
    else return false;
}

const isValidEmailAddress= function(value)
{
    if(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(value)) return true;
    else return false;
}

const isValidPassword = function(value)
{
    if(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(value)) return true
    else return false;
    
}

const createUser= async function(req, res)
{
    try 
    {
        const userData= req.body
        if(!isValidRequestBody(userData)) return res.status(400).send({status: false, message: "Please provide the data..!!"});
        
        const {name, phone, email, password} =userData;

        if(!isValid(userData.title)) return res.status(400).send({status: false, message: "Title is required..!!"});
        if(!(userData.title.trim()==="Mr" || userData.title.trim()==="Miss" || userData.title.trim()==="Mrs"))
        return res.status(400).send({status: false, message: "Title must be either Mr, Miss or Mrs..!!"});

        if(!isValid(name)) return res.status(400).send({status: false, message: "Name is required..!!"});

        if(!isValid(phone)) return res.status(400).send({staus: false, message: "Phone number is required..!!"});
        if(!isValidPhoneNumber(phone)) return res.status(400).send({status:false, message: "Mobile number is not valid..!!"});

        const isPhoneUnique= await userModel.findOne({phone:phone});
        if(isPhoneUnique) return res.status(400).send({status: false, message: "This mobile number is already registered..!!"});

        if(!isValid(email)) return res.status(400).send({staus: false, message: "Email is required..!!"});
        if(!isValidEmailAddress(email)) return res.status(400).send({status: false, message: "Please provide a valid email address..!!"});

        const isEmailUnique= await userModel.findOne({email: email});
        if(isEmailUnique) return res.status(400).send({status: false, message: "This email is already registered..!!"});

        if(!isValid(password)) return res.status(400).send({status: false, message: "Please provide a password..!!"});
        if(!isValidPassword(password)) return res.status(400).send({status:false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"});

        if(!isValid(userData.address.street)) return res.status(400).send({status: false, message: "Please provide the valid Street..!!"});

        if(!isValid(userData.address.city)) return res.status(400).send({status: false, message: "Please provide the valid City name..!!"});

        if(!isValid(userData.address.pincode)) return res.status(400).send({status: false, message: "Please provide the valid pincode"});

        const createUserData= await userModel.create(userData);
        return res.status(201).send({status: true, message: createUserData})
    }
    catch(err)
    {
        console.log(err)
        res.status(500).send({status:false, message:err.message})
    }
}

const userLogin= async function(req, res)
{
    try
    {
        const email= req.body.email;
        const password= req.body.password;
        // if(!email) return res.status(400).send({status: false, message: "Please provide the EmailId..!!"});

        // if(!password) return res.status(400).send({status: false, message: "Plese enter the password..!!"});

        if(!isValid(email)) return res.status(400).send({status: false, message: "Please provide the EmailId..!!"});

        if(!isValidEmailAddress(email)) return res.status(400).send({status:false, message: "Please provide a valid email addres..!!"})

        if(!isValid(password)) return res.status(400).send({staus: false, message: "Please provide the password..!!"});

        if(!isValidPassword(password)) return res.status(400).send({status:false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"});

        const user= await userModel.findOne({ email:email, password: password});
        if(!user) return res.status(400).send({staus: false, message: "Passwaord or email is incorrect..!!"});

        // const token =jwt.sign({userId: user._id.toString()},"SecurityCodeToCheck",{expire:"0.5h"});
        const token= jwt.sign({userId: user._id, email: user._email}, "SecurityCode", {expiresIn:"0.5h"});

        res.setHeader("x-api-key", token);

        res.status(201).send({status: true, message:"Login Successful..!!", token: token});

    }
    catch(err)
    {
        console.log(err)
        res.send({status:false, messgase: err.message});
    }
    
    
}

module.exports.createUser= createUser;
module.exports.userLogin= userLogin;