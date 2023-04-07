import { Schema, model } from "mongoose";

const TodoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  due_date: { type: Date },
  tags: { type: [String] },
  status: { type: String, enum: ["OPEN", "WORKING", "DONE", "OVERDUE"] },
  timestamp: { type: Date, default: Date.now },
});
TodoSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default model("Todo", TodoSchema);
