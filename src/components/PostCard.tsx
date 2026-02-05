import { useEffect, useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal } from './ConfirmModal'

interface PostCardProps {
  post: any
  onDelete?: (id: string) => void
  currentUserId?: string | null
  isAdmin?: boolean
}

export default function PostCard({ post, onDelete, currentUserId: propUserId, isAdmin = false }: PostCardProps) {
  const navigate = useNavigate()
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(propUserId || null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (propUserId) {
      setCurrentUserId(propUserId)
    }
  }, [propUserId])

  useEffect(() => {
    fetchLikeStatus()
  }, [post.id])

  const fetchLikeStatus = async () => {
    try {
      let userId = currentUserId
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
          setCurrentUserId(userId)
        }
      }
      
      if (!userId) return

      // Get like count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
      
      setLikes(count || 0)

      // Check if user liked
      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', userId)
        .single()
      
      setIsLiked(!!data)
    } catch (error) {
      console.error('Error fetching like status:', error)
    }
  }

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigating to detail page
    if (loading) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    // Optimistic update
    const previousLikes = likes
    const previousIsLiked = isLiked
    
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
    setIsLiked(!isLiked)

    try {
      if (previousIsLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
        
        if (error) throw error
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          })
        
        if (error) throw error
      }
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error)
      setLikes(previousLikes)
      setIsLiked(previousIsLiked)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)

      if (error) throw error
      
      if (onDelete) {
        onDelete(post.id)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const getImageUrl = (path: string, bucket = 'photos') => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const handleCardClick = () => {
    navigate(`/post/${post.id}`)
  }

  return (
    <div 
      onClick={handleCardClick}
      className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
    >
      <div className="relative">
        <img 
          src={getImageUrl(post.image_url)} 
          alt={post.caption} 
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center overflow-hidden flex-shrink-0">
              {post.profiles?.avatar_url ? (
                <img 
                  src={getImageUrl(post.profiles.avatar_url, 'avatars')} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <span className="text-xs font-bold text-gray-400">{post.profiles?.username?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">
                {post.profiles?.username || 'Unknown User'}
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                {post.tag && (
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                    #{post.tag}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Delete button: Show if user is owner OR admin */}
          {(currentUserId === post.user_id || isAdmin) && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {post.caption && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed font-medium">
            {post.caption}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={toggleLike}
            className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes > 0 ? likes : 'Like'}</span>
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  )
}
