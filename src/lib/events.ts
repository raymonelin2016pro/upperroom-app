import { supabase } from './supabase'

export type EventRecord = {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  cover_image_url?: string | null
  gallery_images?: unknown
  summary?: string | null
  content?: string | null
  location?: string | null
  starts_at?: string | null
  ends_at?: string | null
  registration_starts_at?: string | null
  registration_ends_at?: string | null
  capacity?: number | null
  status: 'draft' | 'open' | 'closed' | 'archived'
  is_public: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export type EventFieldRecord = {
  id: string
  event_id: string
  field_key: string
  label: string
  field_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'boolean'
  is_required: boolean
  sort_order: number
  options?: unknown
  placeholder?: string | null
  is_active: boolean
}

export type EventManagerState = {
  userId: string | null
  isAdmin: boolean
  isOrganizer: boolean
  canManageAnyEvents: boolean
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getEventManagerState(): Promise<EventManagerState> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      userId: null,
      isAdmin: false,
      isOrganizer: false,
      canManageAnyEvents: false,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('event_organizers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const isAdmin = Boolean(profile?.is_admin)
  const isOrganizer = (count || 0) > 0

  return {
    userId: user.id,
    isAdmin,
    isOrganizer,
    canManageAnyEvents: isAdmin || isOrganizer,
  }
}

export function getEventStatusLabel(status: EventRecord['status']) {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'open':
      return '报名中'
    case 'closed':
      return '已截止'
    case 'archived':
      return '已归档'
    default:
      return '未知状态'
  }
}

export function getEventStatusClasses(status: EventRecord['status']) {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-600'
    case 'open':
      return 'bg-emerald-100 text-emerald-700'
    case 'closed':
      return 'bg-amber-100 text-amber-700'
    case 'archived':
      return 'bg-zinc-100 text-zinc-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

export function parseGalleryImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      }
    } catch {
      return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    }
  }

  return []
}

export function parseFieldOptions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      }
    } catch {
      return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    }
  }

  return []
}

export function isEventRegistrationOpen(event: EventRecord) {
  if (!event || event.status !== 'open') {
    return false
  }

  const now = new Date()
  const startsAt = event.registration_starts_at ? new Date(event.registration_starts_at) : null
  const endsAt = event.registration_ends_at ? new Date(event.registration_ends_at) : null

  if (startsAt && startsAt > now) {
    return false
  }

  if (endsAt && endsAt < now) {
    return false
  }

  return true
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return '待定'
  }

  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(value?: string | null) {
  if (!value) {
    return '待定'
  }

  return new Date(value).toLocaleDateString('zh-CN')
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
