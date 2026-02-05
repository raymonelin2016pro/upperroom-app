<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { PlusIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const posts = ref<any[]>([])
const loading = ref(true)

const fetchPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        image_url,
        caption,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    posts.value = data || []
  } catch (e) {
    console.error('Error fetching posts:', e)
  } finally {
    loading.value = false
  }
}

const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-4">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Feed</h1>
      <button @click="router.push('/profile')" class="text-gray-900 font-medium hover:opacity-70">
        Profile
      </button>
    </div>

    <!-- Feed -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="posts.length === 0" class="text-center py-20 text-gray-500">
      No posts yet. Be the first to share!
    </div>

    <div v-else class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      <div v-for="post in posts" :key="post.id" class="break-inside-avoid bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <img 
          :src="getImageUrl(post.image_url)" 
          :alt="post.caption" 
          class="w-full h-auto object-cover"
          loading="lazy"
        />
        <div class="p-4">
          <div class="flex items-center mb-2">
            <div class="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
              <img v-if="post.profiles?.avatar_url" :src="post.profiles.avatar_url" class="h-full w-full object-cover" />
              <span v-else class="text-xs font-bold text-gray-500">{{ post.profiles?.username?.[0]?.toUpperCase() || 'U' }}</span>
            </div>
            <span class="text-sm font-medium text-gray-900">{{ post.profiles?.username || 'Unknown' }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ post.caption }}</p>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button
      @click="router.push('/create')"
      class="fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
    >
      <PlusIcon class="h-6 w-6" />
    </button>
  </div>
</template>
