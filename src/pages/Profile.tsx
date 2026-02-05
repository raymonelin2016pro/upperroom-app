import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Home, LogOut, Camera, Edit2, X, Check } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      // Get Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      setEditUsername(profileData?.username || '')

      // Get My Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      setPosts(postsData || [])
    } catch (e) {
      console.error('Error fetching profile:', e)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (path: string, bucket = 'photos') => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let avatarPath = profile.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)
        
        if (uploadError) throw uploadError
        avatarPath = fileName
      }

      // Update profile record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: editUsername,
          avatar_url: avatarPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Refresh profile data
      setProfile({ ...profile, username: editUsername, avatar_url: avatarPath })
      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (e) {
      console.error('Error saving profile:', e)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => navigate('/')} className="text-gray-600 hover:text-black transition-colors">
          <Home className="h-6 w-6" />
        </button>
        <button onClick={signOut} className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium transition-colors">
          <LogOut className="h-5 w-5 mr-1" />
          Sign Out
        </button>
      </div>

      <div>
        {/* Profile Info */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mb-6">
              {(avatarPreview || profile?.avatar_url) ? (
                <img 
                  src={avatarPreview || getImageUrl(profile.avatar_url, 'avatars')} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <span className="text-4xl font-bold text-gray-300">{profile?.username?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
            
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-6 right-0 bg-black text-white p-2 rounded-full shadow-md hover:bg-gray-800 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
            />
          </div>

          {isEditing ? (
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="text-2xl font-bold text-center border-b-2 border-black focus:outline-none bg-transparent"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile?.username || 'User'}</h2>
              <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-black transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-sm text-gray-500 font-medium">Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString()}</p>

          {isEditing && (
            <div className="flex items-center space-x-4 mt-6">
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setAvatarPreview(null)
                  setAvatarFile(null)
                  setEditUsername(profile?.username || '')
                }}
                className="flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </button>
              <button 
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* My Posts Grid */}
        <div className="border-t border-gray-100 pt-12">
          <div className="flex items-center justify-center mb-8">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b-2 border-black pb-1">
              My Posts <span className="text-gray-400 ml-1">{posts.length}</span>
            </h3>
          </div>
          
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">Share your first moment</p>
              <button onClick={() => navigate('/create')} className="mt-4 text-black text-sm font-bold hover:underline">
                Create Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-8">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="aspect-square relative group overflow-hidden bg-gray-100 md:rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <img 
                    src={getImageUrl(post.image_url)} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
