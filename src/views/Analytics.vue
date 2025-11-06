<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
      <p class="text-gray-600 mt-1">Insights and statistics about your job search</p>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-6">
        <BarChart3 class="h-10 w-10 text-indigo-600" />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Analytics Coming Soon</h2>
      <p class="text-gray-600 max-w-md mx-auto mb-6">
        Get detailed insights into your job search performance with charts, trends, and success metrics.
      </p>
      <div class="flex justify-center gap-3">
        <router-link 
          to="/dashboard/jobs"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Applications
        </router-link>
      </div>
    </div>

    <!-- Feature Preview -->
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <TrendingUp class="h-5 w-5 text-blue-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Application Trends</h3>
        </div>
        <p class="text-sm text-gray-600">Track your application volume over time</p>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <PieChart class="h-5 w-5 text-green-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Success Rates</h3>
        </div>
        <p class="text-sm text-gray-600">See your interview and offer conversion rates</p>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Target class="h-5 w-5 text-purple-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Response Times</h3>
        </div>
        <p class="text-sm text-gray-600">Average time to hear back from companies</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart3, TrendingUp, PieChart, Target } from 'lucide-vue-next'
</script>