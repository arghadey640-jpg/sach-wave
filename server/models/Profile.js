import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  stream: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  accentColor: {
    type: String,
    default: 'purple'
  }
}, {
  timestamps: true
})

const Profile = mongoose.model('Profile', profileSchema)
export default Profile
