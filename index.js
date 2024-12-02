const router = require('./routes/index.js');
const mongoose = require('mongoose');
const express = require('express');
const {User} = require('./models/userModel.js');
const cors = require('cors');

const app = express();

const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3001/newDataset', 'http://localhost:3001/*'],
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization', 'Multipart/form-data'],
    credentials: true
  };
  
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/', router);
app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post('/api/users', async (req, res) => {
    try {
      // Static user data
      const staticUser = {
        username: 'testUser',
        email: 'testuser@example.com',
        password: 'password123', // In production, always hash the password
        role: 'uploader', // Optional field
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678', // Optional field
      };
  
      // Create a new user with the static data
      const newUser = new User(staticUser);
  
      // Save the user to the database
      const savedUser = await newUser.save();
  
      // Return success response
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  });

mongoose.connect('mongodb+srv://ishitagrawal0207:lpdNBhlHhN8cuoER@cluster0.hg0xkl5.mongodb.net/unfoldHackathon', { dbName: "unfoldHackathon" });

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});