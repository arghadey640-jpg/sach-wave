import mongoose from 'mongoose'

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'funny', 'wow', 'support'],
    default: 'like'
  }
}, {
  timestamps: true
})

// Compound index to prevent duplicate reactions
reactionSchema.index({ user: 1, post: 1 }, { unique: true })

const Reaction = mongoose.model('Reaction', reactionSchema)
export default Reaction
