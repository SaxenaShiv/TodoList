import { Router } from "express";
const router = Router();
import Todo from "../models/Todo.js";

// Get all todos
// router.get('/', async (req, res) => {
//     try {
//       const todos = await Todo.find({});
//       res.status(200).json(todos);
//     } catch (error) {
//       res.status(500).json({ message: 'Internal Server Error', error });
//     }
// });
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search ? { $text: { $search: req.query.search } } : {};
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const todos = await Todo.find(searchQuery).skip(offset).limit(limit).exec();
    const total = await Todo.countDocuments(searchQuery);

    res.status(200).json({ data: todos, total: total });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});

// Add a new todo
router.post("/", async (req, res) => {
  const newTodo = new Todo(req.body);

  try {
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a todo
router.put("/:_id", async (req, res) => {
  try {
    const updatedTodo = await Todo.updateOne(
      { _id: req.params._id },
      { $set: req.body },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a todo
router.delete("/:_id", async (req, res) => {
  try {
    const deletedTodo = await Todo.deleteOne({ _id: req.params._id });
    res.json(deletedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
