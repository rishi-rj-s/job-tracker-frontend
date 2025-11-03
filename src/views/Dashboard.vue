<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar Component -->
    <DashboardSidebar 
      v-model:open="sidebarOpen"
      @logout="handleLogout"
    />

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen lg:ml-64">
      <!-- Header Component -->
      <DashboardHeader 
        @toggle-sidebar="sidebarOpen = true"
      />

      <!-- Main Content Area with Loading State -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <div :key="route.path">
              <!-- Loading Skeleton -->
              <div v-if="isPageLoading" class="space-y-6">
                <div class="animate-pulse">
                  <!-- Header Skeleton -->
                  <div class="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div class="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                  
                  <!-- Content Skeleton -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="h-24 bg-gray-200 rounded"></div>
                    <div class="h-24 bg-gray-200 rounded"></div>
                    <div class="h-24 bg-gray-200 rounded"></div>
                  </div>
                  
                  <div class="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>

              <!-- Actual Content -->
              <component v-else :is="Component" />
            </div>
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Toast Notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@stores/authStore'
import { useToast } from '@composables/useToast'
import DashboardSidebar from '@components/dashboard/layout/DashboardSidebar.vue'
import DashboardHeader from '@components/dashboard/layout/DashboardHeader.vue'
import Toast from '@components/common/Toast.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { showToast } = useToast()

const sidebarOpen = ref(false)
const isPageLoading = ref(false)

// Show loading state during route changes
watch(() => route.path, () => {
  isPageLoading.value = true
  
  // Hide loading after a short delay (component should be mounting by then)
  setTimeout(() => {
    isPageLoading.value = false
  }, 300)
}, { immediate: false })

const handleLogout = async () => {
  const result = await authStore.signOut()
  
  if (result.success) {
    showToast('Logged out successfully', 'green')
    router.push('/')
  } else {
    showToast('Logout failed', 'red')
  }
}
</script>

<style scoped>
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>