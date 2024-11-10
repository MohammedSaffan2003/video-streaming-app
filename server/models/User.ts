import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);