export type HealthStatus = 'unknown' | 'healthy' | 'unhealthy'
export type MilestoneStatus = 'not_started' | 'in_progress' | 'complete'

export interface Deadline {
  id: string
  title: string
  dueDate: string // ISO
  status: 'upcoming' | 'overdue' | 'done'
}

export interface Milestone {
  id: string
  title: string
  status: MilestoneStatus
  dueDate?: string
}

export interface TransactionChecklist {
  id: string
  state: string
  milestones: Milestone[]
}

export interface OfferSummary {
  id: string
  propertyId: string
  price: number
  contingencies?: string[]
  createdAt: string
}

export interface BudgetItem {
  id: string
  label: string
  amount: number
  category: 'deposit' | 'invoice' | 'closing_cost' | 'other'
}

export interface AttomPropertyMinimal {
  identifier?: any
  lot?: any
  utilities?: any
  location?: any
  area?: any
  sale?: any
}

