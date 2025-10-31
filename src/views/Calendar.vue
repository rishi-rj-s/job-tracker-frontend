<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Calendar</h1>
      <p class="text-gray-600 mt-1">Track interviews, follow-ups, and important deadlines</p>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-6">
        <Calendar class="h-10 w-10 text-indigo-600" />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Calendar Coming Soon</h2>
      <p class="text-gray-600 max-w-md mx-auto mb-6">
        Track your interview dates, follow-up reminders, and application deadlines all in one place.
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
            <CalendarCheck class="h-5 w-5 text-blue-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Interview Scheduler</h3>
        </div>
        <p class="text-sm text-gray-600">Schedule and track all your upcoming interviews</p>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <Bell class="h-5 w-5 text-green-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Follow-up Reminders</h3>
        </div>
        <p class="text-sm text-gray-600">Never miss a follow-up with automated reminders</p>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Clock class="h-5 w-5 text-purple-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Deadline Tracking</h3>
        </div>
        <p class="text-sm text-gray-600">Keep track of application and offer deadlines</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, CalendarCheck, Bell, Clock } from 'lucide-vue-next'
</script>