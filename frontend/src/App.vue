<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <nav class="bg-gray-800 text-white sticky top-0 z-10 p-4 flex gap-4">

    <RouterLink to="/" class="hover:text-blue-300 transition-colors">回首頁</RouterLink>
    <RouterLink to="/admin" class="hover:text-blue-300 transition-colors">進入後台</RouterLink>

  </nav>

  <RouterView></RouterView>

  <footer class="bg-gray-800 text-white p-16 flex "> test</footer>

</template>
