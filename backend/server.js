const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. Import Routes
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');

// 2. Initialize the App (This fixes your "app is not defined" error)
const app = express();

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/manga', mangaRoutes);

// 5. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Manga DB Connected Successfully"))
  .catch(err => console.log("DB Connection Error:", err));

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 