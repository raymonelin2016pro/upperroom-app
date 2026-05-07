import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDateTime, parseFieldOptions, type EventFieldRecord, type EventRecord } from '../../lib/events'

type RegistrationRecord = {
  id: string
  user_id: string
  full_name: string
  gender: string
  age: number | null
  church_name: string
  phone: string
  wechat_id: string | null
  is_first_time: boolean
  remark: string | null
  submitted_at: string | null
  status: string
}

type AnswerRecord = {
  id: string
  registration_id: string
  field_id: string
  answer_text: string | null
  answer_json: unknown
}

export default function AdminEventRegistrations() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [event, setEvent] = useState<EventRecord | null>(null)
  const [fields, setFields] = useState<EventFieldRecord[]>([])
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([])
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [authorized, setAuthorized] = useState(true)

  useEffect(() => {
    if (eventId) {
      void fetchRegistrationData()
    }
  }, [eventId])

  const fetchRegistrationData = async () => {
    setLoading(true)
    try {
      const [eventResult, fieldsResult, registrationsResult, answersResult] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('event_form_fields').select('*').eq('event_id', eventId).order('sort_order', { ascending: true }),
        supabase.from('event_registrations').select('*').eq('event_id', eventId).order('submitted_at', { ascending: false }),
        supabase
          .from('event_registration_answers')
          .select(`
            id,
            registration_id,
            field_id,
            answer_text,
            answer_json,
            event_registrations!inner(event_id)
          `)
          .eq('event_registrations.event_id', eventId),
      ])

      if (eventResult.error) {
        setAuthorized(false)
        return
      }

      if (fieldsResult.error) {
        throw fieldsResult.error
      }

      if (registrationsResult.error) {
        throw registrationsResult.error
      }

      if (answersResult.error) {
        throw answersResult.error
      }

      setEvent(eventResult.data as EventRecord)
      setFields((fieldsResult.data as EventFieldRecord[]) || [])
      setRegistrations((registrationsResult.data as RegistrationRecord[]) || [])
      setAnswers(((answersResult.data as any[]) || []).map(answer => ({
        id: answer.id,
        registration_id: answer.registration_id,
        field_id: answer.field_id,
        answer_text: answer.answer_text,
        answer_json: answer.answer_json,
      })))
      setAuthorized(true)
    } catch (error) {
      console.error('Error fetching registration data:', error)
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrations = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) {
      return registrations
    }

    return registrations.filter(registration => (
      registration.full_name.toLowerCase().includes(keyword) ||
      registration.church_name.toLowerCase().includes(keyword) ||
      registration.phone.toLowerCase().includes(keyword)
    ))
  }, [registrations, query])

  const answersByRegistration = useMemo(() => {
    return answers.reduce<Record<string, AnswerRecord[]>>((acc, answer) => {
      if (!acc[answer.registration_id]) {
        acc[answer.registration_id] = []
      }
      acc[answer.registration_id].push(answer)
      return acc
    }, {})
  }, [answers])

  const fieldMap = useMemo(
    () => Object.fromEntries(fields.map(field => [field.id, field])),
    [fields]
  )

  const exportCsv = () => {
    const headers = [
      '姓名',
      '性别',
      '年龄',
      '所属教会/团契',
      '手机号',
      '微信号',
      '首次参加',
      '备注',
      '提交时间',
      ...fields.map(field => field.label),
    ]

    const rows = filteredRegistrations.map(registration => {
      const registrationAnswers = answersByRegistration[registration.id] || []
      const answerMap = Object.fromEntries(registrationAnswers.map(answer => [answer.field_id, answer]))

      return [
        registration.full_name,
        registration.gender,
        registration.age ?? '',
        registration.church_name,
        registration.phone,
        registration.wechat_id ?? '',
        registration.is_first_time ? '是' : '否',
        registration.remark ?? '',
        formatDateTime(registration.submitted_at),
        ...fields.map(field => formatAnswer(answerMap[field.id])),
      ]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event?.slug || 'event'}-registrations.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!authorized || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">你暂时没有权限查看该活动的报名数据</h1>
        <button
          onClick={() => navigate('/admin/events')}
          className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          返回活动后台
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate(`/admin/events/${event.id}`)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            返回活动编辑页
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            导出 CSV
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title} 报名数据</h1>
          <p className="text-slate-600">当前共收到 {registrations.length} 份报名。</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={eventValue => setQuery(eventValue.target.value)}
              placeholder="按姓名、教会或手机号搜索"
              className="w-full bg-transparent focus:outline-none text-sm text-slate-700"
            />
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
            暂无报名数据。
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map(registration => {
              const registrationAnswers = answersByRegistration[registration.id] || []

              return (
                <div key={registration.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{registration.full_name}</h2>
                      <p className="text-sm text-slate-500">
                        提交时间：{formatDateTime(registration.submitted_at)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      已提交
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm text-slate-600 mb-6">
                    <InfoItem label="性别" value={registration.gender} />
                    <InfoItem label="年龄" value={registration.age ?? '未填写'} />
                    <InfoItem label="所属教会/团契" value={registration.church_name} />
                    <InfoItem label="手机号" value={registration.phone} />
                    <InfoItem label="微信号" value={registration.wechat_id || '未填写'} />
                    <InfoItem label="首次参加" value={registration.is_first_time ? '是' : '否'} />
                    <InfoItem label="备注" value={registration.remark || '未填写'} />
                    <InfoItem label="状态" value={registration.status} />
                  </div>

                  {registrationAnswers.length > 0 && (
                    <div className="border-t border-slate-100 pt-5">
                      <h3 className="text-base font-semibold text-slate-900 mb-3">自定义回答</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {registrationAnswers.map(answer => (
                          <div key={answer.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                            <div className="text-sm text-slate-500 mb-1">{fieldMap[answer.field_id]?.label || '未命名问题'}</div>
                            <div className="text-sm text-slate-900">{formatAnswer(answer)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="text-slate-800">{value}</div>
    </div>
  )
}

function formatAnswer(answer?: AnswerRecord) {
  if (!answer) {
    return '未填写'
  }

  if (answer.answer_text) {
    return answer.answer_text
  }

  if (Array.isArray(answer.answer_json)) {
    return answer.answer_json.join('、')
  }

  if (typeof answer.answer_json === 'boolean') {
    return answer.answer_json ? '是' : '否'
  }

  if (typeof answer.answer_json === 'string') {
    return answer.answer_json
  }

  return '未填写'
}
