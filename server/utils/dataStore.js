import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../data')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  profiles: path.join(DATA_DIR, 'profiles.json'),
  posts: path.join(DATA_DIR, 'posts.json'),
  stories: path.join(DATA_DIR, 'stories.json'),
  comments: path.join(DATA_DIR, 'comments.json'),
  likes: path.join(DATA_DIR, 'likes.json'),
  notifications: path.join(DATA_DIR, 'notifications.json'),
  followers: path.join(DATA_DIR, 'followers.json'),
  messages: path.join(DATA_DIR, 'messages.json'),
  reactions: path.join(DATA_DIR, 'reactions.json'),
  storyViews: path.join(DATA_DIR, 'storyViews.json'),
  userPoints: path.join(DATA_DIR, 'userPoints.json'),
  chatSessions: path.join(DATA_DIR, 'chatSessions.json'),
  profileSettings: path.join(DATA_DIR, 'profileSettings.json')
}

// Initialize files if they don't exist
Object.values(FILES).forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]))
  }
})

const readFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// Users
export const getUsers = () => readFile(FILES.users)
export const saveUsers = (users) => writeFile(FILES.users, users)

// Profiles
export const getProfiles = () => readFile(FILES.profiles)
export const saveProfiles = (profiles) => writeFile(FILES.profiles, profiles)

// Posts
export const getPosts = () => readFile(FILES.posts)
export const savePosts = (posts) => writeFile(FILES.posts, posts)

// Stories
export const getStories = () => readFile(FILES.stories)
export const saveStories = (stories) => writeFile(FILES.stories, stories)

// Comments
export const getComments = () => readFile(FILES.comments)
export const saveComments = (comments) => writeFile(FILES.comments, comments)

// Likes
export const getLikes = () => readFile(FILES.likes)
export const saveLikes = (likes) => writeFile(FILES.likes, likes)

// Notifications
export const getNotifications = () => readFile(FILES.notifications)
export const saveNotifications = (notifications) => writeFile(FILES.notifications, notifications)

// Followers
export const getFollowers = () => readFile(FILES.followers)
export const saveFollowers = (followers) => writeFile(FILES.followers, followers)

// Messages
export const getMessages = () => readFile(FILES.messages)
export const saveMessages = (messages) => writeFile(FILES.messages, messages)

// Reactions
export const getReactions = () => readFile(FILES.reactions)
export const saveReactions = (reactions) => writeFile(FILES.reactions, reactions)

// Story Views
export const getStoryViews = () => readFile(FILES.storyViews)
export const saveStoryViews = (storyViews) => writeFile(FILES.storyViews, storyViews)

// User Points (Gamification)
export const getUserPoints = () => readFile(FILES.userPoints)
export const saveUserPoints = (userPoints) => writeFile(FILES.userPoints, userPoints)

// Chat Sessions
export const getChatSessions = () => readFile(FILES.chatSessions)
export const saveChatSessions = (chatSessions) => writeFile(FILES.chatSessions, chatSessions)

// Profile Settings
export const getProfileSettings = () => readFile(FILES.profileSettings)
export const saveProfileSettings = (profileSettings) => writeFile(FILES.profileSettings, profileSettings)
