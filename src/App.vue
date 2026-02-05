<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 font-sans antialiased">
    <RouterView />
  </div>
</template>

<style>
/* Global minimal styles if needed */
body {
  margin: 0;
  background-color: #ffffff;
}
</style>
