import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
}, {
  timestamps: true,
});

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);