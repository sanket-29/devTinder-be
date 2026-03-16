 const adminAuth = (req,res,next) => {
    const token = "xyz";
const isAdminAuthorized = token === "xyz";
if(!isAdminAuthorized){
    res.status(401).send("Unauthorized request");
}else{
    console.log("executed!!");
    next();
    // res.send("authorized!!!");
}
}

module.exports = {adminAuth};