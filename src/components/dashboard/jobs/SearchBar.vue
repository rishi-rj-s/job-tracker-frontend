<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <!-- Main Search Bar -->
    <div class="flex gap-3">
      <div class="flex-1 relative">
        <input
          v-model="searchParams.query"
          type="text"
          placeholder="Search by company name..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          @input="debouncedSearch"
          @keyup.enter="handleSearch"
        />
        <Search class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
      </div>

      <!-- Advanced Filters Toggle -->
      <button
        @click="showAdvanced = !showAdvanced"
        class="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        :class="{ 'bg-blue-50 border-blue-300': showAdvanced }"
      >
        <SlidersHorizontal class="h-5 w-5" />
        <span class="hidden sm:inline">Filters</span>
        <ChevronDown :class="['h-4 w-4 transition-transform', showAdvanced ? 'rotate-180' : '']" />
      </button>

      <!-- Search Button -->
      <button
        @click="handleSearch"
        :disabled="isSearching"
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search class="h-5 w-5" />
        <span class="hidden sm:inline">{{ isSearching ? 'Searching...' : 'Search' }}</span>
      </button>
    </div>

    <!-- Advanced Filters (Collapsible) -->
    <transition name="slide-down">
      <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-gray-200 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div>
            <label for="search-status" class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              v-model="searchParams.status"
              id="search-status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            >
              <option value="">All Statuses</option>
              <option v-for="status in allStatuses" :key="status.key" :value="status.key">
                {{ status.name }}
              </option>
            </select>
          </div>

          <!-- Platform Filter -->
          <div>
            <label for="search-platform" class="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              v-model="searchParams.platform"
              id="search-platform"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            >
              <option value="">All Platforms</option>
              <option v-for="platform in allPlatforms" :key="platform.key" :value="platform.key">
                {{ platform.name }}
              </option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label for="search-date-from" class="block text-sm font-medium text-gray-700 mb-1">
              Applied From
            </label>
            <input
              v-model="searchParams.dateFrom"
              type="date"
              id="search-date-from"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            />
          </div>

          <!-- Date To -->
          <div>
            <label for="search-date-to" class="block text-sm font-medium text-gray-700 mb-1">
              Applied To
            </label>
            <input
              v-model="searchParams.dateTo"
              type="date"
              id="search-date-to"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            />
          </div>

          <!-- Sort By -->
          <div>
            <label for="search-sort-by" class="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              v-model="searchParams.sortBy"
              id="search-sort-by"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            >
              <option value="date_applied">Date Applied</option>
              <option value="company">Company</option>
              <option value="job_title">Job Title</option>
              <option value="status">Status</option>
              <option value="created_at">Date Created</option>
            </select>
          </div>

          <!-- Sort Order -->
          <div>
            <label for="search-sort-order" class="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              v-model="searchParams.sortOrder"
              id="search-sort-order"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <!-- Clear Filters Button -->
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2 items-center">
      <span class="text-sm text-gray-600 font-medium">Active filters:</span>
      
      <span v-if="searchParams.query" class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        Company: "{{ searchParams.query }}"
        <button @click="searchParams.query = ''; handleSearch()" class="hover:text-blue-900">
          <X class="h-3 w-3" />
        </button>
      </span>
      
      <span v-if="searchParams.status" class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        Status: {{ getStatusName(searchParams.status) }}
        <button @click="searchParams.status = ''; handleSearch()" class="hover:text-blue-900">
          <X class="h-3 w-3" />
        </button>
      </span>
      
      <span v-if="searchParams.platform" class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        Platform: {{ getPlatformName(searchParams.platform) }}
        <button @click="searchParams.platform = ''; handleSearch()" class="hover:text-blue-900">
          <X class="h-3 w-3" />
        </button>
      </span>
      
      <span v-if="searchParams.dateFrom" class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        From: {{ searchParams.dateFrom }}
        <button @click="searchParams.dateFrom = ''; handleSearch()" class="hover:text-blue-900">
          <X class="h-3 w-3" />
        </button>
      </span>
      
      <span v-if="searchParams.dateTo" class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
        To: {{ searchParams.dateTo }}
        <button @click="searchParams.dateTo = ''; handleSearch()" class="hover:text-blue-900">
          <X class="h-3 w-3" />
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-vue-next'
import { useJobStore } from '@/stores/jobStore'
import { useStatusStore } from '@/stores/statusStore'
import { usePlatformStore } from '@/stores/platformStore'

const jobStore = useJobStore()
const statusStore = useStatusStore()
const platformStore = usePlatformStore()

const isSearching = ref(false)
const showAdvanced = ref(false)

const searchParams = ref({
  query: '',
  status: '',
  platform: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date_applied',
  sortOrder: 'desc'
})

// Get all statuses (default + user custom)
const allStatuses = computed(() => {
  return Object.entries(statusStore.statuses).map(([key, name]) => ({
    key,
    name
  }))
})

// Get all platforms (default + user custom)
const allPlatforms = computed(() => {
  return Object.entries(platformStore.platforms).map(([key, name]) => ({
    key,
    name
  }))
})

const hasActiveFilters = computed(() => {
  return !!(
    searchParams.value.query ||
    searchParams.value.status ||
    searchParams.value.platform ||
    searchParams.value.dateFrom ||
    searchParams.value.dateTo
  )
})

const getStatusName = (key: string) => {
  return statusStore.statuses[key] || key
}

const getPlatformName = (key: string) => {
  return platformStore.platforms[key] || key
}

let debounceTimeout: ReturnType<typeof setTimeout>

const debouncedSearch = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    handleSearch()
  }, 800) // Wait 800ms after user stops typing
}

const handleSearch = async () => {
  // If no search query and no filters, fetch normally instead
  if (!hasActiveFilters.value) {
    await jobStore.fetchJobs(1)
    return
  }

  isSearching.value = true
  try {
    await jobStore.searchJobs(searchParams.value)
  } finally {
    isSearching.value = false
  }
}

const clearFilters = async () => {
  searchParams.value = {
    query: '',
    status: '',
    platform: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date_applied',
    sortOrder: 'desc'
  }
  showAdvanced.value = false
  // Fetch normally when all filters cleared
  await jobStore.fetchJobs(1)
}

onMounted(() => {
  // Ensure statuses and platforms are loaded
  if (Object.keys(statusStore.statuses).length === 0) {
    statusStore.fetchStatuses()
  }
  if (Object.keys(platformStore.platforms).length === 0) {
    platformStore.fetchPlatforms()
  }
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}
</style>