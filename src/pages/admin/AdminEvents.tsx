import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ClipboardList, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  type EventRecord,
  formatDate,
  getEventManagerState,
  getEventStatusClasses,
  getEventStatusLabel,
} from '../../lib/events'

export default function AdminEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    void fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const managerState = await getEventManagerState()
      setIsAdmin(managerState.isAdmin)
      setCanManage(managerState.canManageAnyEvents)

      if (!managerState.canManageAnyEvents || !managerState.userId) {
        setEvents([])
        return
      }

      let query = supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (!managerState.isAdmin) {
        const { data: organizerRows, error: organizerError } = await supabase
          .from('event_organizers')
          .select('event_id')
          .eq('user_id', managerState.userId)

        if (organizerError) {
          throw organizerError
        }

        const eventIds = (organizerRows || []).map(item => item.event_id)

        if (eventIds.length === 0) {
          setEvents([])
          return
        }

        query = query.in('id', eventIds)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setEvents((data as EventRecord[]) || [])
    } catch (error) {
      console.error('Error fetching admin events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">你暂时没有活动管理权限</h1>
        <p className="text-slate-500 mb-6">需要全局管理员权限，或被分配为某个活动的组织者后才能进入后台。</p>
        <button
          onClick={() => navigate('/events')}
          className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          返回活动页
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            返回活动列表
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/events/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              新建活动
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-8">
          <p className="text-sm font-medium text-blue-600 mb-2">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">活动管理后台</h1>
          <p className="text-slate-600">
            {isAdmin ? '你可以查看并管理全部活动。' : '你可以查看并管理自己负责的活动。'}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">暂时没有可管理的活动</h2>
            <p className="text-slate-500">
              {isAdmin ? '可以先创建一个活动。' : '等待管理员把你加入某个活动的组织者名单。'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {event.cover_image_url && (
                  <img src={event.cover_image_url} alt={event.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventStatusClasses(event.status)}`}>
                      {getEventStatusLabel(event.status)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500 mb-5">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(event.starts_at)}</span>
                    </div>
                    <div className="line-clamp-2">{event.summary || '暂无活动摘要'}</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                      className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                      编辑活动
                    </button>
                    <button
                      onClick={() => navigate(`/admin/events/${event.id}/registrations`)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      <ClipboardList className="h-4 w-4" />
                      报名数据
                    </button>
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
