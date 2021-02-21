const { UserInputError } = require('apollo-server');
const bcrypt = require ('bcryptjs');
const jwt= require('jsonwebtoken');

const { validateRegisterInput } = require('../../util/validators');

const {SECRET_KEY} = require('../../config');
const User = require('../../modules/User');


 module.exports={
     Mutation :{
        async  register(_,            
            {
                registerInput:{ username, email, password, confirmPassword }
            },
            context,
            info)
            {
             // validate user data 

             const { errors, valid } = validateRegisterInput(username,email, password,confirmPassword);

              if (!valid) {
                 throw new UserInputError('Errors', { errors });
            }
             //TODO makes sure user doesnt already exist
             const user=  await User.findOne({username})
             if (user) {
                 throw new UserInputError('user name is exist',{
                     errors:{
                         username:'This username already exist'
                     }
                 })

             }
             
             // hash password and create an auth token 

             password = await bcrypt.hash(password,12);

             const newUser= new User({
                 email,
                 username,
                 password,
                 createdAt: new Date().toISOString()
             });
             const res = await newUser.save();

             const token = jwt.sign({
                 id : res.id,
                 email: res.email,
                 username: res.username
             },SECRET_KEY, {expiresIn:'1h'});

             return{
                 ...res._doc,
                 id: res._id,
                 token 
             };

             
         }
     }
 }