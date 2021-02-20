 const { model, Schema} =require('mongoose');

 const userSchema = new schema({
     username : String,
     password: String ,
     email: String, 
     createdAt: String       
 });

 module.exports = model('User', userSchema);