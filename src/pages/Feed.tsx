import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, User, Sparkles } from 'lucide-react'
import { POST_TAGS } from '../lib/utils'
import PostCard from '../components/PostCard'
import WeeklyTheme from '../components/WeeklyTheme'

export default function Feed() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<{ id: string, is_admin: boolean } | null>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [selectedTag])

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
          id: user.id,
          is_admin: profile?.is_admin || false
        })
      }
    } catch (e) {
      console.error('Error fetching user:', e)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let query = supabase
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
        .order('created_at', { ascending: false })

      if (selectedTag) {
        query = query.eq('tag', selectedTag)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (e) {
      console.error('Error fetching posts:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur-md z-20 py-4 border-b border-gray-50">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-sans">Moment</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/icebreaker')} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="破冰抽卡"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>

      <WeeklyTheme />

      {/* Tag Filter */}
      <div className="flex overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedTag
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </button>
          {POST_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="break-inside-avoid bg-gray-100 rounded-2xl overflow-hidden h-64 animate-pulse"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Plus className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {selectedTag ? `No posts in #${selectedTag}` : 'No moments yet'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs">
            {selectedTag ? 'Try selecting another tag or create a new post.' : 'Be the first to share a photo with your friends.'}
          </p>
          <button 
            onClick={() => navigate('/create')}
            className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-24">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost}
              currentUserId={currentUser?.id}
              isAdmin={currentUser?.is_admin}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/create')}
        className="fixed bottom-8 right-8 h-14 w-14 bg-black text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center focus:outline-none z-30 group"
      >
        <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  )
}
