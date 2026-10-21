export const getWeekDays = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)

  const labels = ['L', 'M', 'M', 'J', 'V']
  const fullLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return {
      label: labels[i],
      fullLabel: fullLabels[i],
      dateString: `${yyyy}-${mm}-${dd}`,
    }
  })
}

export const WEEKDAY_SCHEDULES: Record<number, Array<{ subject: string; time: string; icon: string }>> = {
  0: [
    { subject: 'Matemáticas', time: '7:00–8:30', icon: '📚' },
    { subject: 'Castellano', time: '8:30–10:00', icon: '📖' },
  ],
  1: [
    { subject: 'Castellano', time: '7:00–8:30', icon: '📖' },
    { subject: 'Ciencias Nat.', time: '8:30–10:00', icon: '🧪' },
  ],
  2: [
    { subject: 'Ciencias Nat.', time: '7:00–8:30', icon: '🧪' },
    { subject: 'Inglés', time: '8:30–10:00', icon: '🇬🇧' },
  ],
  3: [
    { subject: 'Matemáticas', time: '7:00–8:30', icon: '📚' },
    { subject: 'Castellano', time: '8:30–10:00', icon: '📖' },
    { subject: 'Inglés', time: '7:00–8:30', icon: '🇬🇧' },
  ],
  4: [
    { subject: 'Ed. Física', time: '7:00–8:30', icon: '⚽' },
    { subject: 'Inglés', time: '8:30–10:00', icon: '🇬🇧' },
  ],
}

export const normalizeStr = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}
