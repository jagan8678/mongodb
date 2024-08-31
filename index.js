const express = require('express');  //import expreess
const mongoose = require('mongoose'); //
const app = express(); //Create an Express application instance
const {body , validationResult} = require('express-validator');
const methodOverride = require('method-override');
mongoose.connect('mongodb+srv://test:test@cluster0.wiecoxl.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0')
const db = mongoose.connection;
db.on('error',console.error.bind(console, 'MongoDB connection error'));

const userSchema = new mongoose.Schema({
    name : String,
    age : Number,
    email : String
})
const User = mongoose.model('User',userSchema);

app.use(express.json()); // Middleware to parse JSON bodies of incoming requests
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.use(express.static('public'));





// to get alll users
app.get("/user" , async (req,res)=>{
    try{
        const users = await User.find();  // Retrieve all users from the database
        res.render('user-lists',{users});   // Send the users as a response
    }catch(error){
        res.status(500).send(error);
    }
})


app.get('/user/new', (req, res) => {
    res.render('new-user', { errors: null });
});


app.post("/user" , [
    body('name').isLength({min:4}).withMessage('Name is required with min 4 chars'),
    body('age').isInt({min:18}).withMessage('Age must be a number greater than 18'),
    body('email').isEmail().withMessage('Invalid email Address')
], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.render('new-user', {errors:errors.array()});
    }
    try{
        const user = new User(req.body);
        await  user.save();
        res.redirect('/user');
        
    }catch(error){
        res.status(500).send(error);
    }
})

/*
app.get("/user/:id" , async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).send('User not found');
        }
        res.send(user);
    }catch(error){
        res.status(500).send(error);
    }
})
*/

app.delete("/user/:id" , async (req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).send('User not found');
        }
        res.redirect('/user');
    }catch(error){
        res.status(500).send(error);
    }
})

app.get('/user/:id/edit', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('edit-user', { user: user, errors: null });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/user/:id', [
    body('name').isLength({ min: 4 }).withMessage('Name is required with min 4 chars'),
    body('age').isInt({ min: 18 }).withMessage('Age must be a number greater than 18'),
    body('email').isEmail().withMessage('Invalid email Address')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('edit-user', { user: req.body, errors: errors.array() });
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.redirect('/user');
    } catch (error) {
        res.status(500).send(error.message);
    }
});




const PORT = 3000;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})