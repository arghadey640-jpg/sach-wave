import { motion } from 'framer-motion'

export const PostSkeleton = () => (
  <div className="bg-white mb-4 shadow-sm overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-3 p-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
      </div>
    </div>
    {/* Content */}
    <div className="px-4 pb-3">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
    </div>
    {/* Image */}
    <div className="h-64 bg-gray-200 animate-pulse" />
    {/* Actions */}
    <div className="flex items-center gap-4 p-4">
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
)

export const StorySkeleton = () => (
  <div className="flex gap-4 px-4 py-4 overflow-x-auto scrollbar-hide">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex-shrink-0 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-12 h-3 bg-gray-200 rounded mt-2 animate-pulse" />
      </div>
    ))}
  </div>
)

export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 pb-20">
    {/* Cover */}
    <div className="h-32 bg-gray-200 animate-pulse" />
    {/* Profile Info */}
    <div className="px-4 pb-4">
      <div className="flex items-end gap-4 -mt-12 mb-4">
        <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white animate-pulse" />
        <div className="flex-1 pb-2">
          <div className="h-8 bg-gray-200 rounded w-24 ml-auto animate-pulse" />
        </div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
      {/* Stats */}
      <div className="flex gap-6 py-4 border-y border-gray-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center flex-1">
            <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const UserListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    ))}
  </div>
)

export const ChatListSkeleton = ({ count = 6 }) => (
  <div className="space-y-1">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)

export const NotificationSkeleton = ({ count = 5 }) => (
  <div className="space-y-1">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)

export const ExploreGridSkeleton = () => (
  <div className="grid grid-cols-3 gap-1">
    {[...Array(9)].map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
    ))}
  </div>
)

const SkeletonLoader = {
  Post: PostSkeleton,
  Story: StorySkeleton,
  Profile: ProfileSkeleton,
  UserList: UserListSkeleton,
  ChatList: ChatListSkeleton,
  Notification: NotificationSkeleton,
  ExploreGrid: ExploreGridSkeleton,
}

export default SkeletonLoader
