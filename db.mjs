import mongoose from 'mongoose';

// Schemas
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: '/images/profilePic.png' } //lead to the location of a default profile picture if a user didn't set up one
}, {timestamps: true});

// Register models
const User = mongoose.model('User', UserSchema);

export {
    User
};

mongoose.connect('mongodb+srv://admin:admin001@cluster0.vtbeb7y.mongodb.net/?retryWrites=true&w=majority').then(() => {
  console.log('database connection successful');
}).catch((err) => {
  console.log('database connection error ' + err);
});