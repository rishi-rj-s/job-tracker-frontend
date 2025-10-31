<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
      <h1 class="text-3xl font-bold mb-2">
        Welcome back, {{ userName }}! 👋
      </h1>
      <p class="text-indigo-100 text-lg">
        Here's your job search overview
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, index) in stats" :key="index"
           class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div :class="['p-3 rounded-lg', stat.bgColor]">
            <component :is="stat.icon" :class="['h-6 w-6', stat.iconColor]" />
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ stat.value }}</h3>
        <p class="text-sm text-gray-600">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Recent Activity & Quick Actions -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Recent Applications -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Recent Applications</h2>
          <router-link to="/dashboard/jobs" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View All →
          </router-link>
        </div>

        <div v-if="recentJobs.length === 0" class="text-center py-8 text-gray-500">
          <BriefcaseIcon class="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No applications yet</p>
          <router-link to="/dashboard/jobs" class="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block">
            Add your first application
          </router-link>
        </div>

        <div v-else class="space-y-3">
          <div v-for="job in recentJobs.slice(0, 5)" :key="job._id || job.id"
               class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 truncate">{{ job.jobTitle }}</h3>
              <p class="text-sm text-gray-600 truncate">{{ job.company }}</p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-3', getStatusClass(job.status)]">
              {{ statusStore.statuses[job.status] || job.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        
        <div class="space-y-3">
          <router-link to="/dashboard/jobs"
                       class="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group">
            <div class="p-3 bg-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
              <Plus class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Add New Application</h3>
              <p class="text-sm text-gray-600">Track a new job application</p>
            </div>
          </router-link>

          <button @click="handleExport"
                  class="w-full flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
            <div class="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
              <Download class="h-6 w-6 text-white" />
            </div>
            <div class="text-left">
              <h3 class="font-semibold text-gray-900">Export Data</h3>
              <p class="text-sm text-gray-600">Download your applications</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tips Section -->
    <div class="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-indigo-600 rounded-lg">
          <Lightbulb class="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 class="font-bold text-gray-900 mb-2">💡 Pro Tip</h3>
          <p class="text-gray-700">
            Keep your applications organized by updating their status regularly. 
            Set next action dates to never miss a follow-up opportunity!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Briefcase as BriefcaseIcon, TrendingUp, Calendar, Target, Plus, Download, Lightbulb } from 'lucide-vue-next'
import { useAuthStore } from '@stores/authStore'
import { useJobStore } from '@stores/jobStore'
import { useStatusStore } from '@stores/statusStore'
import { useToast } from '@composables/useToast'

const authStore = useAuthStore()
const jobStore = useJobStore()
const statusStore = useStatusStore()
const { showToast } = useToast()

const userName = computed(() => {
  return authStore.user?.user_metadata?.full_name?.split(' ')[0] || 'there'
})

const recentJobs = computed(() => {
  return jobStore.jobs.slice(0, 5)
})

const stats = computed(() => {
  const jobs = jobStore.jobs
  
  return [
    {
      icon: BriefcaseIcon,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      value: jobs.length,
      label: 'Total Applications'
    },
    {
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      value: jobs.filter(j => j.status === 'Interview').length,
      label: 'Interviews'
    },
    {
      icon: Calendar,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      value: jobs.filter(j => j.status === 'Screening').length,
      label: 'Screening'
    },
    {
      icon: Target,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      value: jobs.filter(j => j.status === 'Offer').length,
      label: 'Offers'
    }
  ]
})

const getStatusClass = (key: string) => {
  const classes: Record<string, string> = {
    'Applied': 'bg-blue-100 text-blue-700',
    'Screening': 'bg-yellow-100 text-yellow-700',
    'Interview': 'bg-green-100 text-green-700',
    'Offer': 'bg-purple-100 text-purple-700',
    'Rejected': 'bg-red-100 text-red-700',
    'Closed': 'bg-gray-100 text-gray-700',
  }
  return classes[key] || 'bg-gray-100 text-gray-700'
}

const handleExport = async () => {
  const result = await jobStore.exportJobs('csv')
  
  if (result.success) {
    showToast(result.message || 'Export successful!', 'green')
  } else {
    showToast(result.message || 'Export failed', 'red')
  }
}

onMounted(async () => {
  if (jobStore.jobs.length === 0) {
    await jobStore.fetchJobs()
  }
  if (Object.keys(statusStore.statuses).length <= 6) {
    await statusStore.fetchStatuses()
  }
})
</script>