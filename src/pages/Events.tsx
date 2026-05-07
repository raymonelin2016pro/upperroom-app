import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin, Settings } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  type EventRecord,
  formatDate,
  getEventManagerState,
  getEventStatusClasses,
  getEventStatusLabel,
} from '../lib/events'

export default function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    void fetchPageData()
  }, [])

  const fetchPageData = async () => {
    setLoading(true)
    try {
      const [managerState, eventsResult] = await Promise.all([
        getEventManagerState(),
        supabase
          .from('events')
          .select('*')
          .eq('is_public', true)
          .in('status', ['open', 'closed'])
          .order('starts_at', { ascending: true }),
      ])

      if (eventsResult.error) {
        throw eventsResult.error
      }

      setEvents((eventsResult.data as EventRecord[]) || [])
      setCanManage(managerState.canManageAnyEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            返回首页
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/my-events')}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              我的报名
            </button>
            {canManage && (
              <button
                onClick={() => navigate('/admin/events')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
                活动管理
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8">
          <p className="text-sm font-medium text-blue-600 mb-2">UpperRoom Events</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">活动报名</h1>
          <p className="text-slate-600 max-w-2xl">
            在这里查看近期开放的活动，了解详细介绍并完成报名。后续营会、课程、聚会都可以沿用这套入口。
          </p>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="h-64 rounded-3xl bg-white animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">暂时还没有开放中的活动</h2>
            <p className="text-slate-500">管理员发布活动后，这里会自动显示。</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {events.map(event => (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.slug}`)}
                className="text-left bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {event.cover_image_url ? (
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                    <CalendarDays className="h-10 w-10 text-slate-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventStatusClasses(event.status)}`}>
                      {getEventStatusLabel(event.status)}
                    </span>
                  </div>
                  {event.summary && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{event.summary}</p>
                  )}
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(event.starts_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location || '地点待定'}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
