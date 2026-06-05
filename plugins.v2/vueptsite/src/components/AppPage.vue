<template>
  <div class="vpts-root">
    <!-- Header -->
    <div class="vpts-header">
      <div class="vpts-header__top">
        <div class="vpts-header__brand">
          <div class="vpts-logo">
            <v-icon icon="mdi-web" size="24" />
          </div>
          <div>
            <h1 class="vpts-header__title">PT Site</h1>
            <p class="vpts-header__desc">站点用户信息统计</p>
          </div>
        </div>

        <div class="vpts-stats">
          <div class="vpts-stat">
            <span class="vpts-stat__value">{{ sites.length }}</span>
            <span class="vpts-stat__label">站点</span>
          </div>
          <div class="vpts-stat__divider" />
          <div class="vpts-stat vpts-stat--upload">
            <span class="vpts-stat__value">{{ formatSize(totalUpload) }}</span>
            <span class="vpts-stat__label">总上传</span>
          </div>
          <div class="vpts-stat__divider" />
          <div class="vpts-stat vpts-stat--download">
            <span class="vpts-stat__value">{{ formatSize(totalDownload) }}</span>
            <span class="vpts-stat__label">总下载</span>
          </div>
        </div>

        <div class="vpts-header__actions">
          <v-btn
            color="primary"
            variant="tonal"
            :loading="loading"
            @click="refreshAll"
            size="small"
          >
            <v-icon start icon="mdi-refresh" />
            刷新全部
          </v-btn>
        </div>
      </div>

      <!-- Filters -->
      <div class="vpts-header__filters">
        <div class="vpts-search">
          <v-icon icon="mdi-magnify" size="18" class="vpts-search__icon" />
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索站点..."
            class="vpts-search__input"
          />
          <button v-if="keyword" class="vpts-search__clear" @click="keyword = ''">
            <v-icon icon="mdi-close-circle" size="16" />
          </button>
        </div>
        <div class="vpts-filters__meta">
          共 <b>{{ filteredSites.length }}</b> / {{ sites.length }} 个站点
        </div>
      </div>
    </div>

    <!-- Site List -->
    <div v-if="filteredSites.length > 0" class="vpts-list">
      <div
        v-for="site in filteredSites"
        :key="site.id"
        class="vpts-card"
      >
        <div class="vpts-card__header">
          <div class="vpts-card__name">
            <img
              v-if="site.icon"
              :src="site.icon"
              class="vpts-card__icon"
              :alt="site.name"
              @error="(e) => e.target.style.display='none'"
            />
            <v-icon v-else icon="mdi-server" size="18" color="primary" />
            <a
              v-if="site.url"
              :href="site.url"
              target="_blank"
              rel="noopener noreferrer"
              class="vpts-card__link"
            >
              {{ site.name }}
              <v-icon icon="mdi-open-in-new" size="12" class="vpts-card__link-icon" />
            </a>
            <span v-else class="ml-2">{{ site.name }}</span>
            <v-chip v-if="site.error" size="x-small" color="error" variant="tonal" class="ml-2">
              {{ site.error }}
            </v-chip>
          </div>
          <v-btn
            size="x-small"
            variant="text"
            icon="mdi-refresh"
            :loading="refreshingId === site.id"
            @click="refreshSite(site)"
          />
        </div>

        <div class="vpts-card__body">
          <v-row dense>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-account" size="14" color="grey" />
                <span class="vpts-field__label">账号</span>
                <span class="vpts-field__value">{{ site.username || '-' }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-star" size="14" color="amber" />
                <span class="vpts-field__label">等级</span>
                <span class="vpts-field__value">{{ site.level || '-' }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-arrow-up" size="14" color="success" />
                <span class="vpts-field__label">上传</span>
                <span class="vpts-field__value vpts-field__value--upload">{{ formatSize(site.upload) }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-arrow-down" size="14" color="error" />
                <span class="vpts-field__label">下载</span>
                <span class="vpts-field__value vpts-field__value--download">{{ formatSize(site.download) }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-percent" size="14" color="info" />
                <span class="vpts-field__label">分享率</span>
                <span class="vpts-field__value">{{ site.ratio || '0.00' }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-bolt" size="14" color="orange" />
                <span class="vpts-field__label">魔力值</span>
                <span class="vpts-field__value">{{ formatNumber(site.bonus) }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-seeding" size="14" color="teal" />
                <span class="vpts-field__label">做种数</span>
                <span class="vpts-field__value">{{ site.seeding || 0 }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4">
              <div class="vpts-field">
                <v-icon icon="mdi-clock-outline" size="14" color="purple" />
                <span class="vpts-field__label">做种时间</span>
                <span class="vpts-field__value">{{ site.seeding_time || '-' }}</span>
              </div>
            </v-col>
            <v-col cols="6" md="3" sm="4" v-if="site.hr > 0">
              <div class="vpts-field">
                <v-icon icon="mdi-alert" size="14" color="error" />
                <span class="vpts-field__label">H&R</span>
                <span class="vpts-field__value vpts-field__value--hr">{{ site.hr }}</span>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="vpts-empty">
      <v-icon icon="mdi-web-off" size="64" color="grey-lighten-1" />
      <p class="vpts-empty__text">暂无站点数据</p>
      <p class="vpts-empty__hint">请先在 MoviePilot 站点管理中添加 PT 站点</p>
      <v-btn color="primary" variant="tonal" @click="loadSites" class="mt-2">
        <v-icon start icon="mdi-refresh" />
        刷新数据
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="vpts-loading">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  api: { type: Object, default: () => ({}) },
  navKey: { type: String, default: 'main' },
  pluginId: { type: String, default: '' },
})

const sites = ref([])
const loading = ref(false)
const refreshingId = ref(null)
const keyword = ref('')

const filteredSites = computed(() => {
  if (!keyword.value) return sites.value
  const kw = keyword.value.toLowerCase()
  return sites.value.filter(
    (s) =>
      s.name.toLowerCase().includes(kw) ||
      (s.username && s.username.toLowerCase().includes(kw))
  )
})

const totalUpload = computed(() =>
  sites.value.reduce((sum, s) => sum + (s.upload || 0), 0)
)

const totalDownload = computed(() =>
  sites.value.reduce((sum, s) => sum + (s.download || 0), 0)
)

onMounted(async () => {
  console.log('[VuePtSite] Component mounted, pluginId:', props.pluginId)
  await loadSites()
})

async function loadSites() {
  loading.value = true
  try {
    const apiUrl = `plugin/${props.pluginId}/sites`
    console.log('[VuePtSite] Calling API:', apiUrl)
    const result = await props.api.get(apiUrl)
    console.log('[VuePtSite] Raw API result:', JSON.stringify(result))
    
    // Handle different response structures
    let siteData = null
    if (result?.data?.data?.sites) {
      // Structure: { data: { success: true, data: { sites: [...] } } }
      siteData = result.data.data.sites
    } else if (result?.data?.sites) {
      // Structure: { data: { sites: [...] } }
      siteData = result.data.sites
    } else if (result?.sites) {
      // Structure: { sites: [...] }
      siteData = result.sites
    }
    
    console.log('[VuePtSite] Parsed site data:', siteData)
    
    if (siteData && Array.isArray(siteData)) {
      sites.value = siteData
      console.log('[VuePtSite] Loaded sites:', sites.value.length)
    } else {
      console.warn('[VuePtSite] No valid site data found in response')
      sites.value = []
    }
  } catch (error) {
    console.error('[VuePtSite] Failed to load sites:', error)
    sites.value = []
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  loading.value = true
  try {
    await props.api.post(`plugin/${props.pluginId}/site/refresh-all`)
    await loadSites()
  } catch (error) {
    console.error('[VuePtSite] Failed to refresh all:', error)
  } finally {
    loading.value = false
  }
}

async function refreshSite(site) {
  refreshingId.value = site.id
  try {
    await props.api.post(`plugin/${props.pluginId}/site/refresh`, {
      site_id: site.id,
    })
    await loadSites()
  } catch (error) {
    console.error('[VuePtSite] Failed to refresh site:', error)
  } finally {
    refreshingId.value = null
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
</script>

<style scoped>
.vpts-root {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vpts-header {
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.06), rgba(var(--v-theme-primary), 0.02));
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.vpts-header__top {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 18px;
  flex-wrap: wrap;
}

.vpts-header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vpts-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}

.vpts-header__title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
}

.vpts-header__desc {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 2px 0 0;
}

.vpts-stats {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
}

.vpts-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
}

.vpts-stat__value {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.vpts-stat--upload .vpts-stat__value { color: #22c55e; }
.vpts-stat--download .vpts-stat__value { color: #ef4444; }

.vpts-stat__label {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.vpts-stat__divider {
  width: 1px;
  height: 28px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
}

.vpts-header__actions {
  flex-shrink: 0;
}

.vpts-header__filters {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px 14px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.vpts-search {
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 300px;
}

.vpts-search__icon {
  position: absolute;
  left: 10px;
  color: rgba(var(--v-theme-on-surface), 0.35);
  pointer-events: none;
}

.vpts-search__input {
  width: 100%;
  min-height: 32px;
  padding: 5px 32px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  font-size: 0.82rem;
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  box-sizing: border-box;
}

.vpts-search__input:focus {
  border-color: rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.08);
}

.vpts-search__clear {
  position: absolute;
  right: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.35);
  padding: 2px;
  display: flex;
}

.vpts-filters__meta {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.vpts-filters__meta b {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 600;
}

.vpts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vpts-card {
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow: hidden;
  transition: all 0.2s;
}

.vpts-card:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.18);
  box-shadow: 0 2px 12px rgba(var(--v-theme-on-surface), 0.06);
}

.vpts-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.vpts-card__name {
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.vpts-card__icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: 4px;
}

.vpts-card__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.vpts-card__link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.vpts-card__link-icon {
  opacity: 0.6;
}

.vpts-card__body {
  padding: 10px 14px;
}

.vpts-field {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.vpts-field__label {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  min-width: 40px;
}

.vpts-field__value {
  font-size: 0.82rem;
  font-weight: 500;
}

.vpts-field__value--upload { color: #22c55e; }
.vpts-field__value--download { color: #ef4444; }
.vpts-field__value--hr { color: #ef4444; font-weight: 600; }

.vpts-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.vpts-empty__text {
  font-size: 0.9rem;
  margin: 0;
}

.vpts-empty__hint {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
  margin: 0;
}

.vpts-loading {
  display: flex;
  justify-content: center;
  padding: 24px;
}

@media (max-width: 768px) {
  .vpts-header__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .vpts-stats {
    width: 100%;
    justify-content: space-between;
  }

  .vpts-header__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .vpts-search {
    max-width: none;
  }
}
</style>
