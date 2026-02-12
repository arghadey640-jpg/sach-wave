import mongoose from 'mongoose'

const storyViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'text'],
    default: 'image'
  },
  image: {
    type: String,
    default: null
  },
  content: {
    type: String,
    default: null
  },
  background: {
    type: Number,
    default: 0
  },
  views: [storyViewSchema]
}, {
  timestamps: true
})

// Index for expiring stories after 24 hours
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

const Story = mongoose.model('Story', storySchema)
export default Story
