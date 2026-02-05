<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const invitationCode = ref('')
const loading = ref(false)
const errorMsg = ref('')
const needsActivation = ref(false)

const handleAuth = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      await checkActivation()
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            username: email.value.split('@')[0]
          }
        }
      })
      if (error) throw error
      // Signup successful, now check activation (will likely need code)
      await checkActivation()
    }
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

const checkActivation = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_activated')
    .eq('id', user.id)
    .single()

  if (profile && profile.is_activated) {
    router.push('/')
  } else {
    needsActivation.value = true
  }
}

const redeemCode = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const { data, error } = await supabase.rpc('redeem_invitation', {
      invite_code: invitationCode.value
    })
    
    if (error) throw error
    if (!data) throw new Error('Invalid or used invitation code')
    
    router.push('/')
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
          {{ needsActivation ? 'Enter Invite Code' : (isLogin ? 'Welcome Back' : 'Join Us') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Minimalist Photo Sharing
        </p>
      </div>

      <!-- Activation Step -->
      <div v-if="needsActivation" class="space-y-6">
        <div>
          <label for="code" class="sr-only">Invitation Code</label>
          <input
            id="code"
            v-model="invitationCode"
            type="text"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            placeholder="Invitation Code"
          />
        </div>
        <button
          @click="redeemCode"
          :disabled="loading"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
        >
          {{ loading ? 'Verifying...' : 'Enter' }}
        </button>
      </div>

      <!-- Login/Register Step -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleAuth">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm text-center">
          {{ errorMsg }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {{ loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up') }}
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            class="text-sm text-gray-600 hover:text-black"
            @click="isLogin = !isLogin"
          >
            {{ isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
