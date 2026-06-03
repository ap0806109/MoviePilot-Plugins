<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" icon="mdi-web" />
      PT Site
      <v-spacer />
      <v-btn icon="mdi-cog" variant="text" size="small" @click="showConfig = true" />
      <v-btn icon="mdi-refresh" variant="text" size="small" :loading="loading" @click="loadSites" />
      <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')" />
    </v-card-title>

    <v-card-text>
      <div v-if="sites.length > 0">
        <div v-for="site in sites" :key="site.id" class="vpts-dialog-card">
          <div class="vpts-dialog-card__header">
            <v-icon icon="mdi-server" size="16" color="primary" />
            <span class="vpts-dialog-card__name">{{ site.name }}</span>
            <v-chip size="x-small" variant="tonal" color="success">{{ site.level }}</v-chip>
          </div>
          <div class="vpts-dialog-card__body">
            <span>上传: {{ formatSize(site.upload) }}</span>
            <span>下载: {{ formatSize(site.download) }}</span>
            <span>分享率: {{ site.ratio }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-grey pa-4">
        暂无站点数据
      </div>
    </v-card-text>

    <!-- Config Dialog -->
    <v-dialog v-model="showConfig" max-width="600">
      <Config :api="api" :initial-config="config" @close="showConfig = false" />
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Config from './Config.vue'

const props = defineProps({
  api: { type: Object, default: () => ({}) },
  initialConfig: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['switch', 'close'])

const sites = ref([])
const config = ref({})
const loading = ref(false)
const showConfig = ref(false)

onMounted(async () => {
  await loadSites()
  config.value = props.initialConfig || {}
})

async function loadSites() {
  loading.value = true
  try {
    const result = await props.api.get('plugin/VuePtSite/sites')
    const data = result?.data
    if (data && data.success !== false) {
      sites.value = data.data?.sites || []
    }
  } catch (error) {
    console.error('[VuePtSite] Failed to load sites:', error)
  } finally {
    loading.value = false
  }
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.vpts-dialog-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.vpts-dialog-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.vpts-dialog-card__name {
  font-weight: 600;
  font-size: 0.88rem;
}

.vpts-dialog-card__body {
  display: flex;
  gap: 16px;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
