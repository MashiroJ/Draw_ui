import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePointsStore = defineStore('points', () => {
  const points = ref(0)

  function setPoints(newPoints) {
    points.value = newPoints
  }

  function deductPoints(amount) {
    points.value = Math.max(0, points.value - amount)
  }

  function addPoints(amount) {
    points.value += amount
  }

  return {
    points,
    setPoints,
    deductPoints,
    addPoints
  }
}) 