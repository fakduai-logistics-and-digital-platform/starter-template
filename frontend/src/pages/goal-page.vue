<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGoalStore } from '@/stores/use-goal-store'
import { useSEO } from '@/composables/useSEO'
import type { CreateGoalBody, GoalType, UpdateGoalBody } from '@/models'

useSEO({
  title: 'Goals - Wellness',
  description: 'Set and track your wellness goals for steps, calories, water, sleep, and weight.',
  keywords: ['goals', 'wellness', 'target', 'progress', 'fitness'],
})

const store = useGoalStore()

const isDialogOpen = ref(false)
const isSubmitting = ref(false)
const snackbar = ref({ show: false, message: '', color: 'success' })

const goalTypeOptions: { title: string; value: GoalType; icon: string; unit: string }[] = [
  { title: 'Steps', value: 'steps', icon: 'ri-footprint-line', unit: 'steps/day' },
  { title: 'Calories', value: 'calories', icon: 'ri-fire-line', unit: 'kcal/day' },
  { title: 'Water', value: 'water', icon: 'ri-drop-line', unit: 'ml/day' },
  { title: 'Sleep', value: 'sleep', icon: 'ri-moon-line', unit: 'hours/day' },
  { title: 'Weight', value: 'weight', icon: 'ri-scales-3-line', unit: 'kg' },
]

const statusColors: Record<string, string> = {
  active: 'primary',
  completed: 'success',
  paused: 'warning',
}

const form = ref<CreateGoalBody>({
  userId: 'demo-user',
  type: 'steps',
  title: '',
  targetValue: 10000,
  currentValue: 0,
  unit: 'steps/day',
  deadline: '',
})

function onTypeChange(type: GoalType) {
  const opt = goalTypeOptions.find((o) => o.value === type)
  if (opt) form.value.unit = opt.unit
}

function resetForm() {
  form.value = {
    userId: 'demo-user',
    type: 'steps',
    title: '',
    targetValue: 10000,
    currentValue: 0,
    unit: 'steps/day',
    deadline: '',
  }
}

async function submitGoal() {
  isSubmitting.value = true
  const res = await store.create(form.value)
  isSubmitting.value = false
  if (res.ok) {
    snackbar.value = { show: true, message: 'Goal created!', color: 'success' }
    isDialogOpen.value = false
    resetForm()
  } else {
    snackbar.value = { show: true, message: res.error, color: 'error' }
  }
}

async function updateStatus(id: string, body: UpdateGoalBody) {
  const res = await store.update(id, body)
  if (!res.ok) snackbar.value = { show: true, message: res.error, color: 'error' }
}

async function deleteGoal(id: string) {
  await store.remove(id)
  snackbar.value = { show: true, message: 'Goal deleted', color: 'info' }
}

function progress(id: string) {
  return store.goalProgress(id)
}

onMounted(() => store.fetchByUser('demo-user'))
</script>

<template>
  <div>
    <!-- Summary chips -->
    <VRow class="mb-6">
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="44">
              <VIcon icon="ri-flag-line" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Active Goals</div>
              <div class="text-h6 font-weight-bold">{{ store.activeGoals.length }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="44">
              <VIcon icon="ri-checkbox-circle-line" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Completed</div>
              <div class="text-h6 font-weight-bold">{{ store.completedGoals.length }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="secondary" variant="tonal" size="44">
              <VIcon icon="ri-bar-chart-line" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Goals</div>
              <div class="text-h6 font-weight-bold">{{ store.goals.length }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Goals list -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span>My Goals</span>
        <VBtn color="primary" prepend-icon="ri-add-line" @click="isDialogOpen = true">
          New Goal
        </VBtn>
      </VCardTitle>

      <VCardText v-if="store.isLoading" class="text-center py-8">
        <VProgressCircular indeterminate color="primary" />
      </VCardText>

      <VCardText v-else-if="store.goals.length === 0" class="text-center py-8 text-medium-emphasis">
        No goals yet. Create your first wellness goal!
      </VCardText>

      <VList v-else lines="two">
        <VListItem
          v-for="goal in store.goals"
          :key="goal.id"
          class="py-3"
        >
          <template #prepend>
            <VAvatar :color="statusColors[goal.status]" variant="tonal">
              <VIcon :icon="goalTypeOptions.find(o => o.value === goal.type)?.icon ?? 'ri-flag-line'" />
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-medium mb-1">{{ goal.title }}</VListItemTitle>
          <VListItemSubtitle>
            <div class="d-flex align-center gap-2 mb-1">
              <VChip :color="statusColors[goal.status]" size="x-small">{{ goal.status }}</VChip>
              <span class="text-caption">{{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}</span>
              <span class="text-caption text-medium-emphasis">· Due {{ goal.deadline }}</span>
            </div>
            <VProgressLinear :model-value="progress(goal.id)" :color="statusColors[goal.status]" height="6" rounded class="mt-1" style="max-width: 320px;" />
            <span class="text-caption">{{ progress(goal.id) }}%</span>
          </VListItemSubtitle>

          <template #append>
            <div class="d-flex gap-1">
              <VBtn
                v-if="goal.status !== 'completed'"
                size="small"
                variant="text"
                color="success"
                icon="ri-checkbox-circle-line"
                @click="updateStatus(goal.id, { status: 'completed' })"
              >
                <VIcon icon="ri-checkbox-circle-line" />
                <VTooltip activator="parent" location="top">Mark Complete</VTooltip>
              </VBtn>
              <VBtn
                v-if="goal.status === 'active'"
                size="small"
                variant="text"
                color="warning"
                @click="updateStatus(goal.id, { status: 'paused' })"
              >
                <VIcon icon="ri-pause-circle-line" />
                <VTooltip activator="parent" location="top">Pause</VTooltip>
              </VBtn>
              <VBtn
                v-if="goal.status === 'paused'"
                size="small"
                variant="text"
                color="primary"
                @click="updateStatus(goal.id, { status: 'active' })"
              >
                <VIcon icon="ri-play-circle-line" />
                <VTooltip activator="parent" location="top">Resume</VTooltip>
              </VBtn>
              <VBtn size="small" variant="text" color="error" @click="deleteGoal(goal.id)">
                <VIcon icon="ri-delete-bin-line" />
                <VTooltip activator="parent" location="top">Delete</VTooltip>
              </VBtn>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCard>

    <!-- Create Dialog -->
    <VDialog v-model="isDialogOpen" max-width="480" persistent>
      <VCard title="Create Wellness Goal">
        <VCardText>
          <VForm @submit.prevent="submitGoal">
            <VRow>
              <VCol cols="12">
                <VSelect
                  v-model="form.type"
                  label="Goal Type"
                  :items="goalTypeOptions.map(o => ({ title: o.title, value: o.value }))"
                  required
                  @update:model-value="onTypeChange"
                />
              </VCol>
              <VCol cols="12">
                <VTextField v-model="form.title" label="Title" placeholder="e.g. Walk 10,000 steps daily" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model.number="form.targetValue" label="Target Value" type="number" min="1" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model="form.unit" label="Unit" placeholder="steps/day" required />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model.number="form.currentValue" label="Current Value" type="number" min="0" />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model="form.deadline" label="Deadline" type="date" required />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions class="pa-4 pt-0">
          <VSpacer />
          <VBtn variant="text" @click="isDialogOpen = false; resetForm()">Cancel</VBtn>
          <VBtn color="primary" :loading="isSubmitting" @click="submitGoal">Create</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="3000">
      {{ snackbar.message }}
    </VSnackbar>
  </div>
</template>
