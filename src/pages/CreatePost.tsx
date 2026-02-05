import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Image as ImageIcon, X, Tag } from 'lucide-react'
import { POST_TAGS } from '../lib/utils'

export default function CreatePost() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      validateAndSetFile(event.target.files[0])
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      validateAndSetFile(event.dataTransfer.files[0])
    }
  }

  const validateAndSetFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file')
      return
    }
    if (f.size > 5 * 1024 * 1024) { // 5MB
      setErrorMsg('Image size should be less than 5MB')
      return
    }
    
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setErrorMsg('')
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const publish = async () => {
    if (!file) return
    
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Upload image
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Insert post record
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: fileName,
          caption: caption,
          tag: selectedTag || null
        })

      if (insertError) throw insertError

      navigate('/')
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black">Cancel</button>
        <h1 className="text-lg font-bold">New Post</h1>
        <button 
          onClick={publish} 
          disabled={!file || loading}
          className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-800"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 text-red-500 text-sm text-center">
          {errorMsg}
        </div>
      )}

      {/* Image Upload Area */}
      {!previewUrl ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-black hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <ImageIcon className="h-12 w-12 mb-4" />
          <p className="text-sm">Click or drag image to upload</p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-6 group">
          <img src={previewUrl} className="w-full h-auto max-h-[60vh] object-contain" />
          <button 
            onClick={removeFile}
            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Tag Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
          <Tag className="h-4 w-4" />
          <span>Add Tag (Optional)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POST_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-black text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Caption Input */}
      <div className="mt-6">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          maxLength={200}
          className="w-full border-none focus:ring-0 p-0 text-lg placeholder-gray-400 resize-none bg-transparent outline-none"
          placeholder="Write a caption..."
        ></textarea>
        <div className="text-right text-xs text-gray-400 mt-2">
          {caption.length}/200
        </div>
      </div>
    </div>
  )
}
