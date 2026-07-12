<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useHealthLogStore } from '@/stores/use-health-log-store'
import { useSEO } from '@/composables/useSEO'
import type { CreateHealthLogBody } from '@/models'

useSEO({
  title: 'Health Logs - Wellness',
  description: 'Track your daily health metrics: steps, calories, water intake, sleep, and mood.',
  keywords: ['health', 'logs', 'steps', 'calories', 'sleep', 'mood', 'wellness'],
})

const store = useHealthLogStore()

const isDialogOpen = ref(false)
const isSubmitting = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })

const moodLabels: Record<number, string> = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' }
const moodColors: Record<number, string> = { 1: 'error', 2: 'warning', 3: 'info', 4: 'success', 5: 'success' }

const form = ref<CreateHealthLogBody>({
  userId: 'demo-user',
  date: new Date().toISOString().slice(0, 10),
  steps: 0,
  caloriesBurned: 0,
  waterMl: 0,
  sleepHours: 0,
  mood: 3,
})

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Steps', key: 'steps' },
  { title: 'Calories', key: 'caloriesBurned' },
  { title: 'Water (ml)', key: 'waterMl' },
  { title: 'Sleep (hr)', key: 'sleepHours' },
  { title: 'Mood', key: 'mood' },
  { title: 'Note', key: 'note' },
  { title: 'Actions', key: 'actions', sortable: false },
]

function resetForm() {
  form.value = {
    userId: 'demo-user',
    date: new Date().toISOString().slice(0, 10),
    steps: 0,
    caloriesBurned: 0,
    waterMl: 0,
    sleepHours: 0,
    mood: 3,
  }
}

async function submitLog() {
  isSubmitting.value = true
  const res = await store.create(form.value)
  isSubmitting.value = false
  if (res.ok) {
    snackbar.value = { show: true, message: 'Health log saved!', color: 'success' }
    isDialogOpen.value = false
    resetForm()
  } else {
    snackbar.value = { show: true, message: res.error, color: 'error' }
  }
}

async function deleteLog(id: string) {
  await store.remove(id)
  snackbar.value = { show: true, message: 'Log deleted', color: 'info' }
}

onMounted(() => store.fetchByUser('demo-user'))
</script>

<template>
  <div>
    <!-- Stats row -->
    <VRow class="mb-6">
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="44">
              <VIcon icon="ri-footprint-line" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Steps</div>
              <div class="text-h6 font-weight-bold">{{ store.totalSteps.toLocaleString() }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="44">
              <VIcon icon="ri-moon-line" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Avg Sleep</div>
              <div class="text-h6 font-weight-bold">{{ store.avgSleepHours.toFixed(1) }} hr</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="warning" variant="tonal" size="44">
              <VIcon icon="ri-emotion-line" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Avg Mood</div>
              <div class="text-h6 font-weight-bold">{{ store.avgMood.toFixed(1) }} / 5</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Table -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span>Health Logs</span>
        <VBtn color="primary" prepend-icon="ri-add-line" @click="isDialogOpen = true">
          Log Today
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="store.logs"
        :loading="store.isLoading"
        item-value="id"
        class="text-no-wrap"
      >
        <template #item.mood="{ item }">
          <VChip :color="moodColors[item.mood]" size="small">
            {{ moodLabels[item.mood] }}
          </VChip>
        </template>
        <template #item.note="{ item }">
          <span class="text-truncate" style="max-width: 160px; display: block;">{{ item.note ?? '—' }}</span>
        </template>
        <template #item.actions="{ item }">
          <IconBtn size="small" color="error" @click="deleteLog(item.id)">
            <VIcon icon="ri-delete-bin-line" />
            <VTooltip activator="parent" location="top">Delete</VTooltip>
          </IconBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create Dialog -->
    <VDialog v-model="isDialogOpen" max-width="520" persistent>
      <VCard title="Log Health Metrics">
        <VCardText>
          <VForm @submit.prevent="submitLog">
            <VRow>
              <VCol cols="12" sm="6">
                <VTextField v-model="form.date" label="Date" type="date" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model.number="form.steps" label="Steps" type="number" min="0" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model.number="form.caloriesBurned" label="Calories Burned" type="number" min="0" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model.number="form.waterMl" label="Water (ml)" type="number" min="0" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model.number="form.sleepHours" label="Sleep (hours)" type="number" min="0" max="24" step="0.5" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VSelect
                  v-model.number="form.mood"
                  label="Mood"
                  :items="[1,2,3,4,5].map(n => ({ title: `${n} – ${moodLabels[n]}`, value: n }))"
                  required
                />
              </VCol>
              <VCol cols="12">
                <VTextarea v-model="form.note" label="Note (optional)" rows="2" />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions class="pa-4 pt-0">
          <VSpacer />
          <VBtn variant="text" @click="isDialogOpen = false; resetForm()">Cancel</VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submitLog">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.message }}
    </VSnackbar>
  </div>
</template>
