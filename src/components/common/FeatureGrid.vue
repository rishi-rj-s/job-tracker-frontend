<template>
  <div class="grid md:grid-cols-3 gap-4">
    <div 
      v-for="(feature, index) in features" 
      :key="index"
      class="bg-white rounded-lg p-6 border border-gray-200"
    >
      <div class="flex items-center gap-3 mb-3">
        <div 
          class="p-2 rounded-lg"
          :style="{ backgroundColor: `${feature.color}15` }"
        >
          <component 
            :is="getIcon(feature.icon)" 
            class="h-5 w-5" 
            :style="{ color: feature.color }"
          />
        </div>
        <h3 class="font-semibold text-gray-900">{{ feature.title }}</h3>
      </div>
      <p class="text-sm text-gray-600">{{ feature.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CalendarCheck, 
  Bell, 
  Clock, 
  TrendingUp, 
  PieChart, 
  Target,
  UserCircle,
  MessageSquare,
  Mail,
  BarChart,
  FileText,
  Search,
  Settings,
  Download,
  Upload,
  Filter,
  Globe
} from 'lucide-vue-next'

interface Feature {
  icon: string
  color: string // Now accepts any color (hex, rgb, named colors, etc.)
  title: string
  description: string
}

defineProps<{
  features: Feature[]
}>()

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'calendar-check': CalendarCheck,
    'bell': Bell,
    'clock': Clock,
    'trending-up': TrendingUp,
    'pie-chart': PieChart,
    'target': Target,
    'user-circle': UserCircle,
    'message-square': MessageSquare,
    'mail': Mail,
    'bar-chart': BarChart,
    'file-text': FileText,
    'search': Search,
    'settings': Settings,
    'download': Download,
    'upload': Upload,
    'filter': Filter,
    'globe': Globe
  }
  return icons[iconName] || Bell
}
</script>