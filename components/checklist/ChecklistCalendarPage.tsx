import React from 'react'
import ChecklistCalendar from './ChecklistCalendar'
import { useTaskContext } from '../TaskContext'

export default function ChecklistCalendarPage() {
  const { tasks, updateTask } = useTaskContext()

  return (
    <div className="space-y-6">
      <ChecklistCalendar
        tasks={tasks}
        onUpdateTask={(taskId, updates) => updateTask(taskId, updates)}
      />
    </div>
  )
}

