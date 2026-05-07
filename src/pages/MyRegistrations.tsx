import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDateTime } from '../lib/events'

type RegistrationRow = {
  id: string
  status: string
  submitted_at: string | null
  full_name: string
  church_name: string
  events: {
    id: string
    slug: string
    title: string
    location: string | null
    starts_at: string | null
    cover_image_url: string | null
  } | null
}

type RawRegistrationRow = Omit<RegistrationRow, 'events'> & {
  events: RegistrationRow['events'] | RegistrationRow['events'][]
}

export default function MyRegistrations() {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          status,
          submitted_at,
          full_name,
          church_name,
          events (
            id,
            slug,
            title,
            location,
            starts_at,
            cover_image_url
          )
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })

      if (error) {
        throw error
      }

      const rows = ((data as RawRegistrationRow[]) || []).map(item => ({
        ...item,
        events: Array.isArray(item.events) ? (item.events[0] || null) : item.events,
      }))

      setRegistrations(rows)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          返回活动列表
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">我的报名</h1>
          <p className="text-slate-600">这里会显示你已经提交过的活动报名记录。</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(item => (
              <div key={item} className="h-40 rounded-3xl bg-white animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">你还没有报名任何活动</h2>
            <button
              onClick={() => navigate('/events')}
              className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              去看看最近活动
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map(registration => (
              <div key={registration.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {registration.events?.cover_image_url && (
                  <img
                    src={registration.events.cover_image_url}
                    alt={registration.events.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {registration.events?.title || '活动已下线'}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">报名人：{registration.full_name}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      已提交
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDateTime(registration.events?.starts_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{registration.events?.location || '地点待定'}</span>
                    </div>
                    <div>所属教会：{registration.church_name}</div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    {registration.events?.slug && (
                      <button
                        onClick={() => navigate(`/events/${registration.events?.slug}`)}
                        className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        查看活动详情
                      </button>
                    )}
                    <span className="text-sm text-slate-400 self-center">
                      提交时间：{formatDateTime(registration.submitted_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
