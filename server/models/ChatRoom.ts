import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
  },
  activeUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

export const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);