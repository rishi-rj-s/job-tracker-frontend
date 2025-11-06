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

      <!-- Main Content Area -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Toast Notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@stores/authStore'
import { useToast } from '@composables/useToast'
import DashboardSidebar from '@components/dashboard/layout/DashboardSidebar.vue'
import DashboardHeader from '@components/dashboard/layout/DashboardHeader.vue'
import Toast from '@components/common/Toast.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const sidebarOpen = ref(false)

const handleLogout = async () => {
  showToast('Logging out...', 'blue')
  
  const result = await authStore.signOut()
  
  if (result.success) {
    showToast('Logged out successfully. See you soon!', 'green')
    router.push('/')
  } else {
    showToast('Logout failed. Please try again.', 'red')
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