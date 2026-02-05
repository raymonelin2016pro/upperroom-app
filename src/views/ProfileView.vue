<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { ArrowLeftStartOnRectangleIcon, HomeIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const profile = ref<any>(null)
const posts = ref<any[]>([])
const loading = ref(true)

const fetchProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Get Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    profile.value = profileData

    // Get My Posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      
    posts.value = postsData || []
  } catch (e) {
    console.error('Error fetching profile:', e)
  } finally {
    loading.value = false
  }
}

const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

const signOut = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <button @click="router.push('/')" class="text-gray-600 hover:text-black">
        <HomeIcon class="h-6 w-6" />
      </button>
      <button @click="signOut" class="text-red-500 hover:text-red-700 flex items-center text-sm font-medium">
        <ArrowLeftStartOnRectangleIcon class="h-5 w-5 mr-1" />
        Sign Out
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div v-else>
      <!-- Profile Info -->
      <div class="flex flex-col items-center mb-12">
        <div class="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
          <img v-if="profile?.avatar_url" :src="profile.avatar_url" class="h-full w-full object-cover" />
          <span v-else class="text-2xl font-bold text-gray-500">{{ profile?.username?.[0]?.toUpperCase() || 'U' }}</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900">{{ profile?.username || 'User' }}</h2>
        <p class="text-sm text-gray-500 mt-1">Joined {{ new Date(profile?.created_at || Date.now()).toLocaleDateString() }}</p>
      </div>

      <!-- My Posts Grid -->
      <div class="border-t pt-8">
        <h3 class="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">My Posts ({{ posts.length }})</h3>
        
        <div v-if="posts.length === 0" class="text-center py-10 text-gray-400 text-sm">
          You haven't posted anything yet.
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-1">
          <div v-for="post in posts" :key="post.id" class="aspect-square relative group bg-gray-100 overflow-hidden cursor-pointer">
            <img 
              :src="getImageUrl(post.image_url)" 
              class="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
