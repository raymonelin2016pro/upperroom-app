import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Edit2, Send, X } from 'lucide-react'

interface WeeklyThemeData {
  id: string
  content: string
  created_at: string
}

export default function WeeklyTheme() {
  const [theme, setTheme] = useState<WeeklyThemeData | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newTheme, setNewTheme] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTheme()
    checkAdmin()
  }, [])

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_themes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching theme:', error)
      }
      
      if (data) {
        setTheme(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (data?.is_admin) {
      setIsAdmin(true)
    }
  }

  const handleSave = async () => {
    if (!newTheme.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('weekly_themes')
        .insert({
          content: newTheme,
          created_by: user.id
        })

      if (error) throw error

      setTheme({
        id: 'optimistic',
        content: newTheme,
        created_at: new Date().toISOString()
      })
      setIsEditing(false)
      setNewTheme('')
      fetchTheme() // Refresh to get real ID
    } catch (error) {
      console.error('Error saving theme:', error)
      alert('Failed to update theme')
    }
  }

  if (loading) return null
  if (!theme && !isAdmin) return null

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-lg">
        <div className="relative bg-white bg-opacity-95 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Weekly Verse / Theme
            </h2>
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                placeholder="Enter this week's verse or theme..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-gray-800"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-4 h-4" /> Update
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none">
              <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed font-serif italic text-center py-2">
                "{theme?.content || 'No theme set for this week'}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
