<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { PhotoIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const caption = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    setFile(input.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    setFile(event.dataTransfer.files[0])
  }
}

const setFile = (f: File) => {
  if (!f.type.startsWith('image/')) {
    errorMsg.value = 'Please upload an image file'
    return
  }
  if (f.size > 5 * 1024 * 1024) { // 5MB
    errorMsg.value = 'Image size should be less than 5MB'
    return
  }
  
  file.value = f
  previewUrl.value = URL.createObjectURL(f)
  errorMsg.value = ''
}

const removeFile = () => {
  file.value = null
  previewUrl.value = null
}

const publish = async () => {
  if (!file.value) return
  
  loading.value = true
  errorMsg.value = ''

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Upload image
    const fileExt = file.value.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file.value)

    if (uploadError) throw uploadError

    // 2. Insert post record
    const { error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        image_url: fileName,
        caption: caption.value
      })

    if (insertError) throw insertError

    router.push('/')
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <button @click="router.back()" class="text-gray-500 hover:text-black">Cancel</button>
      <h1 class="text-lg font-bold">New Post</h1>
      <button 
        @click="publish" 
        :disabled="!file || loading"
        class="bg-black text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-800"
      >
        {{ loading ? 'Posting...' : 'Post' }}
      </button>
    </div>

    <div v-if="errorMsg" class="mb-4 text-red-500 text-sm text-center">
      {{ errorMsg }}
    </div>

    <!-- Image Upload Area -->
    <div 
      v-if="!previewUrl"
      class="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-black hover:bg-gray-50 transition-colors cursor-pointer"
      @click="(($refs.fileInput) as HTMLInputElement).click()"
      @dragover.prevent
      @drop="handleDrop"
    >
      <PhotoIcon class="h-12 w-12 mb-4" />
      <p class="text-sm">Click or drag image to upload</p>
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        class="hidden" 
        @change="handleFileChange"
      />
    </div>

    <!-- Image Preview -->
    <div v-else class="relative rounded-xl overflow-hidden bg-gray-100 mb-6 group">
      <img :src="previewUrl" class="w-full h-auto max-h-[60vh] object-contain" />
      <button 
        @click="removeFile"
        class="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <!-- Caption Input -->
    <div class="mt-6">
      <textarea
        v-model="caption"
        rows="4"
        maxlength="200"
        class="w-full border-none focus:ring-0 p-0 text-lg placeholder-gray-400 resize-none bg-transparent"
        placeholder="Write a caption..."
      ></textarea>
      <div class="text-right text-xs text-gray-400 mt-2">
        {{ caption.length }}/200
      </div>
    </div>
  </div>
</template>
