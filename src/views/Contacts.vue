<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Contacts</h1>
      <p class="text-gray-600 mt-1">Manage recruiters, hiring managers, and professional connections</p>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-6">
        <Users class="h-10 w-10 text-indigo-600" />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Contacts Coming Soon</h2>
      <p class="text-gray-600 max-w-md mx-auto mb-6">
        Keep track of recruiters, hiring managers, and important contacts throughout your job search journey.
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
            <UserCircle class="h-5 w-5 text-blue-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Contact Directory</h3>
        </div>
        <p class="text-sm text-gray-600">Store recruiter and hiring manager information</p>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <MessageSquare class="h-5 w-5 text-green-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Communication Log</h3>
        </div>
        <p class="text-sm text-gray-600">Track all interactions and conversations</p>
      </div>

      <div class="bg-white rounded-lg p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Mail class="h-5 w-5 text-purple-600" />
          </div>
          <h3 class="font-semibold text-gray-900">Follow-up Notes</h3>
        </div>
        <p class="text-sm text-gray-600">Add notes and reminders for each contact</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, UserCircle, MessageSquare, Mail } from 'lucide-vue-next'
</script>