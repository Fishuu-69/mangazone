const express = require('express');
const router = express.Router();
const Manga = require('../models/Manga');
const auth = require('../middleware/auth'); 

// 1. GET ALL (Already implemented)
router.get('/', auth, async (req, res) => {
  try {
    const manga = await Manga.find({ userId: req.user.id });
    res.json(manga);
  } catch (err) { res.status(500).json(err); }
});

// 2. NEW: GET SINGLE BY ID (This helps with viewing specific details)
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Manga.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: "Manga not found" });
    res.json(item);
  } catch (err) { res.status(500).json(err); }
});

// 3. CREATE (Already implemented)
router.post('/', auth, async (req, res) => {
  try {
    const newManga = new Manga({ ...req.body, userId: req.user.id });
    const saved = await newManga.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json(err); }
});

// 4. UPDATE BY ID
router.put('/:id', auth, async (req, res) => {
  try {
    // findOneAndUpdate ensures the user only updates THEIR OWN manga
    const updatedManga = await Manga.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true } // Returns the modified document rather than the original
    );
    if (!updatedManga) return res.status(404).json({ message: "Manga not found or unauthorized" });
    res.json(updatedManga);
  } catch (err) { res.status(400).json(err); }
});

// 5. DELETE BY ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedManga = await Manga.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!deletedManga) return res.status(404).json({ message: "Manga not found or unauthorized" });
    res.json({ message: "Manga entry successfully deleted" });
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;