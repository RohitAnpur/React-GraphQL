const { UserInputError } = require('apollo-server');
const bcrypt = require ('bcryptjs');
const jwt= require('jsonwebtoken');

const { validateRegisterInput, validateLoginInput} = require('../../util/validators');

const {SECRET_KEY} = require('../../config');
const User = require('../../modules/User');

function generateToken(user){
    return jwt.sign(
        {
        id : user.id,
        email: user.email,
        username: user.username
       },
       SECRET_KEY, 
       {expiresIn:'1h'}
    );
}


 module.exports={
     Mutation :{

        async login(_,{username,password}){
            const { errors, valid } = validateLoginInput(username, password);

            if (!valid){
                throw new UserInputError('Errors',{errors})
            }

            const user = await User.findOne({username});

            if (!user){
                errors.general ='user not found ';
                throw new UserInputError('user not found ',{ errors })
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match){

                errors.general ='Wrong credentials ';
                throw new UserInputError('Wrong credentials  ',{ errors })

            }
            const token = generateToken(user);

            return{
                ...user._doc,
                id: user._id,
                token 
            };

        },
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

             const token = generateToken(res);

             return{
                 ...res._doc,
                 id: res._id,
                 token 
             };

             
         }
     }
 }