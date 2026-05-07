import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin, Settings, UserCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  type EventFieldRecord,
  type EventRecord,
  formatDateTime,
  getEventManagerState,
  getEventStatusClasses,
  getEventStatusLabel,
  isEventRegistrationOpen,
  parseGalleryImages,
} from '../lib/events'

export default function EventDetail() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [event, setEvent] = useState<EventRecord | null>(null)
  const [fields, setFields] = useState<EventFieldRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasRegistered, setHasRegistered] = useState(false)
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    if (slug) {
      void fetchEventDetail(slug)
    }
  }, [slug])

  const fetchEventDetail = async (eventSlug: string) => {
    setLoading(true)
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', eventSlug)
        .single()

      if (eventError) {
        throw eventError
      }

      const managerState = await getEventManagerState()

      const [fieldsResult, registrationResult] = await Promise.all([
        supabase
          .from('event_form_fields')
          .select('*')
          .eq('event_id', eventData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        managerState.userId
          ? supabase
              .from('event_registrations')
              .select('id')
              .eq('event_id', eventData.id)
              .eq('user_id', managerState.userId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])

      if (fieldsResult.error) {
        throw fieldsResult.error
      }

      if ('error' in registrationResult && registrationResult.error) {
        throw registrationResult.error
      }

      setEvent(eventData as EventRecord)
      setFields((fieldsResult.data as EventFieldRecord[]) || [])
      setHasRegistered(Boolean('data' in registrationResult && registrationResult.data))
      setCanManage(managerState.isAdmin || managerState.isOrganizer)
    } catch (error) {
      console.error('Error fetching event detail:', error)
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

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">活动不存在或你暂时无权查看</h1>
        <button
          onClick={() => navigate('/events')}
          className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          返回活动列表
        </button>
      </div>
    )
  }

  const galleryImages = parseGalleryImages(event.gallery_images)
  const canRegister = isEventRegistrationOpen(event)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            返回活动列表
          </button>
          {canManage && (
            <button
              onClick={() => navigate(`/admin/events/${event.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Settings className="h-4 w-4" />
              后台管理
            </button>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          {event.cover_image_url ? (
            <img src={event.cover_image_url} alt={event.title} className="w-full h-72 md:h-96 object-cover" />
          ) : (
            <div className="w-full h-72 md:h-96 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100" />
          )}

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventStatusClasses(event.status)}`}>
                {getEventStatusLabel(event.status)}
              </span>
              {hasRegistered && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  你已报名
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title}</h1>
            {event.subtitle && <p className="text-lg text-slate-600 mb-6">{event.subtitle}</p>}
            {event.summary && <p className="text-slate-700 text-base leading-7 mb-8">{event.summary}</p>}

            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <CalendarDays className="h-4 w-4" />
                  活动时间
                </div>
                <p className="text-slate-900 font-medium">{formatDateTime(event.starts_at)}</p>
                <p className="text-slate-500 text-sm mt-1">结束时间：{formatDateTime(event.ends_at)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <MapPin className="h-4 w-4" />
                  地点与报名
                </div>
                <p className="text-slate-900 font-medium">{event.location || '地点待定'}</p>
                <p className="text-slate-500 text-sm mt-1">截止时间：{formatDateTime(event.registration_ends_at)}</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-10">
              <p className="whitespace-pre-wrap leading-8 text-slate-700">
                {event.content || '活动详细介绍待补充。'}
              </p>
            </div>

            {galleryImages.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">活动展示</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {galleryImages.map(image => (
                    <img
                      key={image}
                      src={image}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-2xl border border-slate-100"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">报名会收集的信息</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {['姓名', '性别', '年龄', '所属教会/团契', '手机号', '微信号', '是否首次参加', '备注'].map(label => (
                  <div key={label} className="px-4 py-3 rounded-2xl bg-slate-50 text-slate-700 text-sm">
                    {label}
                  </div>
                ))}
                {fields.map(field => (
                  <div key={field.id} className="px-4 py-3 rounded-2xl bg-slate-50 text-slate-700 text-sm">
                    {field.label}
                    {field.is_required ? '（必填）' : '（选填）'}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-sm text-blue-200 mb-2">
                  <UserCheck className="h-4 w-4" />
                  报名说明
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {hasRegistered ? '你已经完成报名' : canRegister ? '现在就可以报名参加' : '当前暂未开放报名'}
                </h2>
                <p className="text-slate-300 text-sm leading-6">
                  提交后即视为报名成功。若后续活动方有补充说明，可以直接在后台查看完整名单并跟进。
                </p>
              </div>
              {hasRegistered ? (
                <button
                  onClick={() => navigate('/my-events')}
                  className="px-5 py-3 rounded-full bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors"
                >
                  查看我的报名
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/events/${event.slug}/register`)}
                  disabled={!canRegister}
                  className="px-5 py-3 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  立即报名
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
