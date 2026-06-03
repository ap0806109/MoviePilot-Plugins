<template>
  <v-app>
    <v-main>
      <AppPage :api="mockApi" plugin-id="VuePtSite" nav-key="main" />
    </v-main>
  </v-app>
</template>

<script setup>
import AppPage from './components/AppPage.vue'

const mockApi = {
  get: async (path) => {
    console.log('GET', path)
    return { data: { success: true, data: { sites: [], total: 0 } } }
  },
  post: async (path, data) => {
    console.log('POST', path, data)
    return { data: { success: true } }
  },
}
</script>
