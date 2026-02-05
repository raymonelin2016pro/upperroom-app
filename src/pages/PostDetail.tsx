import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Send } from 'lucide-react'
import PostCard from '../components/PostCard'

interface Comment {
  id: string
  text: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string
  }
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        setCurrentUser({
          ...user,
          is_admin: profile?.is_admin || false
        })
      }
    } catch (e) {
      console.error('Error fetching user:', e)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
    }
  }, [id])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          tag,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setPost(data)
    } catch (e) {
      console.error('Error fetching post:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          text,
          created_at,
          user_id,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (e) {
      console.error('Error fetching comments:', e)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setSubmittingComment(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: id,
          user_id: currentUser.id,
          text: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      fetchComments()
    } catch (e) {
      console.error('Error submitting comment:', e)
    } finally {
      setSubmittingComment(false)
    }
  }

  const getImageUrl = (path: string, bucket = 'photos') => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
        <p className="text-gray-500 mb-6">The post you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          Go back home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-8 sticky top-0 bg-white/95 backdrop-blur-md z-20 py-4 -mx-4 px-4 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Post Details</h1>
      </div>

      <div className="max-w-xl mx-auto">
        <PostCard 
          post={post} 
          currentUserId={currentUser?.id}
          isAdmin={currentUser?.is_admin}
          onDelete={() => navigate('/')}
        />

        {/* Comments Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

          {/* Comment List */}
          <div className="space-y-6 mb-8">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center overflow-hidden">
                      {comment.profiles?.avatar_url ? (
                        <img 
                          src={getImageUrl(comment.profiles.avatar_url, 'avatars')} 
                          className="h-full w-full object-cover" 
                          alt={comment.profiles.username}
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">
                          {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-900">
                        {comment.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              disabled={submittingComment}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
