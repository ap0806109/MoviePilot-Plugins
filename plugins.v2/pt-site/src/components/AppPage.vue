<template>
  <v-container fluid class="pt-site-container">
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-web</v-icon>
            PT Site - 站点信息统计
          </v-card-title>
          <v-card-actions>
            <v-btn color="primary" @click="refreshAll" :loading="loading">
              <v-icon start>mdi-refresh</v-icon>
              刷新所有站点
            </v-btn>
            <v-spacer></v-spacer>
            <v-chip :color="stats.total > 0 ? 'success' : 'grey'" variant="tonal">
              共 {{ stats.total }} 个站点
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4" lg="3" v-for="site in sites" :key="site.id">
        <v-card :class="{ 'card-error': site.error }">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" :color="site.user_info ? 'success' : 'grey'">
              {{ site.user_info ? 'mdi-check-circle' : 'mdi-circle-outline' }}
            </v-icon>
            {{ site.name }}
          </v-card-title>
          
          <v-card-text v-if="site.user_info">
            <v-list density="compact" lines="two">
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary" size="small">mdi-account</v-icon>
                </template>
                <v-list-item-title>账号</v-list-item-title>
                <v-list-item-subtitle>{{ site.user_info.username }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="secondary" size="small">mdi-star</v-icon>
                </template>
                <v-list-item-title>等级</v-list-item-title>
                <v-list-item-subtitle>{{ site.user_info.level }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="success" size="small">mdi-arrow-up</v-icon>
                </template>
                <v-list-item-title>上传量</v-list-item-title>
                <v-list-item-subtitle>{{ formatSize(site.user_info.upload) }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="error" size="small">mdi-arrow-down</v-icon>
                </template>
                <v-list-item-title>下载量</v-list-item-title>
                <v-list-item-subtitle>{{ formatSize(site.user_info.download) }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning" size="small">mdi-percent</v-icon>
                </template>
                <v-list-item-title>分享率</v-list-item-title>
                <v-list-item-subtitle>{{ site.user_info.ratio }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="site.user_info.bonus > 0">
                <template #prepend>
                  <v-icon color="orange" size="small">mdi-bolt</v-icon>
                </template>
                <v-list-item-title>魔力值</v-list-item-title>
                <v-list-item-subtitle>{{ formatNumber(site.user_info.bonus) }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="site.user_info.seeding > 0">
                <template #prepend>
                  <v-icon color="info" size="small">mdi-seeding</v-icon>
                </template>
                <v-list-item-title>做种数</v-list-item-title>
                <v-list-item-subtitle>{{ site.user_info.seeding }} 个 ({{ formatSize(site.user_info.seeding_size) }})</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="site.user_info.hr > 0">
                <template #prepend>
                  <v-icon color="error" size="small">mdi-alert</v-icon>
                </template>
                <v-list-item-title>Hit&amp;Run</v-list-item-title>
                <v-list-item-subtitle>{{ site.user_info.hr }} 个</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="site.user_info.seeding_time">
                <template #prepend>
                  <v-icon color="purple" size="small">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>做种时间</v-list-item-title>
                <v-list-item-subtitle>
                  {{ site.user_info.seeding_time.days }}天 {{ site.user_info.seeding_time.hours }}小时
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          
          <v-card-text v-else-if="site.error" class="text-error">
            <v-icon>mdi-alert-circle</v-icon>
            {{ site.error }}
          </v-card-text>
          
          <v-card-text v-else class="text-grey">
            <v-icon>mdi-clock-outline</v-icon>
            未同步
          </v-card-text>
          
          <v-card-actions v-if="site.user_info || site.error">
            <v-spacer></v-spacer>
            <v-btn size="small" variant="text" @click="refreshSite(site)">
              <v-icon start>mdi-refresh</v-icon>
              刷新
            </v-btn>
          </v-card-actions>
          
          <v-card-subtitle v-if="site.last_sync" class="text-caption">
            最后同步：{{ formatTime(site.last_sync) }}
          </v-card-subtitle>
        </v-card>
      </v-col>
      
      <v-col cols="12" v-if="sites.length === 0">
        <v-alert type="info" variant="tonal" border="start">
          暂无站点配置，请在 MoviePilot 的站点设置中添加 PT 站点
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-if="totalStats.total > 0" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-bar</v-icon>
            汇总统计
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <v-statistic label="总上传量" :value="formatSize(totalStats.upload)">
                  <v-icon color="success" size="small">mdi-arrow-up</v-icon>
                </v-statistic>
              </v-col>
              <v-col cols="6" md="3">
                <v-statistic label="总下载量" :value="formatSize(totalStats.download)">
                  <v-icon color="error" size="small">mdi-arrow-down</v-icon>
                </v-statistic>
              </v-col>
              <v-col cols="6" md="3">
                <v-statistic label="总做种数" :value="totalStats.seeding">
                  <v-icon color="info" size="small">mdi-seeding</v-icon>
                </v-statistic>
              </v-col>
              <v-col cols="6" md="3">
                <v-statistic label="总 H&amp;R" :value="totalStats.hr">
                  <v-icon color="error" size="small">mdi-alert</v-icon>
                </v-statistic>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  api: Object,
  pluginId: String,
  hideTitle: Boolean,
})

const sites = ref([])
const loading = ref(false)

const stats = computed(() => ({
  total: sites.value.length,
}))

const totalStats = computed(() => {
  return sites.value.reduce(
    (acc, site) => {
      if (site.user_info) {
        acc.upload += site.user_info.upload || 0
        acc.download += site.user_info.download || 0
        acc.seeding += site.user_info.seeding || 0
        acc.hr += site.user_info.hr || 0
      }
      return acc
    },
    { upload: 0, download: 0, seeding: 0, hr: 0, total: sites.value.length }
  )
})

onMounted(async () => {
  await loadSites()
})

async function loadSites() {
  try {
    const response = await props.api.get(`plugin/${props.pluginId}/sites`)
    if (response.data && response.data.success !== false) {
      sites.value = response.data.sites || []
    }
  } catch (error) {
    console.error('Failed to load sites:', error)
  }
}

async function refreshAll() {
  loading.value = true
  try {
    const response = await props.api.post(`plugin/${props.pluginId}/site/refresh-all`)
    if (response.data && response.data.success) {
      await loadSites()
    }
  } catch (error) {
    console.error('Failed to refresh all:', error)
  } finally {
    loading.value = false
  }
}

async function refreshSite(site) {
  try {
    await props.api.post(`plugin/${props.pluginId}/site/refresh`, { site_id: site.id })
    await loadSites()
  } catch (error) {
    console.error('Failed to refresh site:', error)
  }
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatNumber(num) {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.pt-site-container {
  padding: 16px;
}

.card-error {
  border: 2px solid #ef4444;
}

.v-statistic {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.v-statistic .v-icon {
  margin-top: 8px;
}
</style>
