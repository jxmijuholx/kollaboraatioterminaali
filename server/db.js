require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const url = process.env.MONGODB_URI;

console.log('Connecting to MongoDB');

async function connectDB() {
    try {
        const result = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        console.log('Database:', result.connections[0].name);
    } catch (error) {
        console.log('Error connecting to MongoDB:', error.message);
    }
}

module.exports = {connectDB};
