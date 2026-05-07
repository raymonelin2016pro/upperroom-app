import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  type EventFieldRecord,
  type EventRecord,
  formatDateTime,
  isEventRegistrationOpen,
  parseFieldOptions,
} from '../lib/events'

type FixedFormState = {
  full_name: string
  gender: string
  age: string
  church_name: string
  phone: string
  wechat_id: string
  is_first_time: boolean
  remark: string
}

const initialForm: FixedFormState = {
  full_name: '',
  gender: '',
  age: '',
  church_name: '',
  phone: '',
  wechat_id: '',
  is_first_time: false,
  remark: '',
}

export default function EventRegister() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [event, setEvent] = useState<EventRecord | null>(null)
  const [fields, setFields] = useState<EventFieldRecord[]>([])
  const [form, setForm] = useState<FixedFormState>(initialForm)
  const [answers, setAnswers] = useState<Record<string, string | boolean | string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const canRegister = useMemo(() => (event ? isEventRegistrationOpen(event) : false), [event])

  useEffect(() => {
    if (slug) {
      void fetchRegistrationSetup(slug)
    }
  }, [slug])

  const fetchRegistrationSetup = async (eventSlug: string) => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', eventSlug)
        .single()

      if (eventError) {
        throw eventError
      }

      const [fieldsResult, existingResult, profileResult] = await Promise.all([
        supabase
          .from('event_form_fields')
          .select('*')
          .eq('event_id', eventData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', eventData.id)
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single(),
      ])

      if (fieldsResult.error) {
        throw fieldsResult.error
      }

      if (existingResult.error) {
        throw existingResult.error
      }

      if (profileResult.error) {
        throw profileResult.error
      }

      setEvent(eventData as EventRecord)
      setFields((fieldsResult.data as EventFieldRecord[]) || [])
      setSubmitted(Boolean(existingResult.data))
      setForm(prev => ({
        ...prev,
        full_name: profileResult.data?.username || prev.full_name,
      }))
    } catch (fetchError) {
      console.error('Error fetching registration setup:', fetchError)
      setError('加载报名页失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    if (!event) {
      return
    }

    if (!canRegister) {
      setError('当前活动暂未开放报名。')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const payload = {
        event_id: event.id,
        user_id: user.id,
        full_name: form.full_name.trim(),
        gender: form.gender.trim(),
        age: form.age ? Number(form.age) : null,
        church_name: form.church_name.trim(),
        phone: form.phone.trim(),
        wechat_id: form.wechat_id.trim() || null,
        is_first_time: form.is_first_time,
        remark: form.remark.trim() || null,
      }

      const { data: registrationData, error: registrationError } = await supabase
        .from('event_registrations')
        .insert(payload)
        .select('id')
        .single()

      if (registrationError) {
        throw registrationError
      }

      const answerRows = fields
        .map(field => {
          const answer = answers[field.field_key]

          if (
            answer === undefined ||
            answer === '' ||
            (Array.isArray(answer) && answer.length === 0)
          ) {
            return null
          }

          if (field.field_type === 'text' || field.field_type === 'textarea') {
            return {
              registration_id: registrationData.id,
              field_id: field.id,
              answer_text: String(answer),
              answer_json: null,
            }
          }

          return {
            registration_id: registrationData.id,
            field_id: field.id,
            answer_text: null,
            answer_json: answer,
          }
        })
        .filter(Boolean)

      if (answerRows.length > 0) {
        const { error: answersError } = await supabase
          .from('event_registration_answers')
          .insert(answerRows)

        if (answersError) {
          throw answersError
        }
      }

      setSubmitted(true)
    } catch (submitError: any) {
      console.error('Error submitting registration:', submitError)
      if (submitError?.code === '23505') {
        setError('你已经报过名了，无需重复提交。')
      } else {
        setError('报名提交失败，请稍后重试。')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const updateAnswer = (fieldKey: string, value: string | boolean | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [fieldKey]: value,
    }))
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
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">活动不存在或暂时不可报名</h1>
        <button
          onClick={() => navigate('/events')}
          className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          返回活动列表
        </button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">报名成功</h1>
            <p className="text-slate-600 mb-8">
              你已经完成《{event.title}》的报名，后续如有通知可在活动方统一联系中获取。
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/my-events')}
                className="px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                查看我的报名
              </button>
              <button
                onClick={() => navigate(`/events/${event.slug}`)}
                className="px-5 py-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                返回活动详情
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/events/${event.slug}`)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          返回活动详情
        </button>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h1>
            <p className="text-slate-500 text-sm">报名截止：{formatDateTime(event.registration_ends_at)}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {!canRegister && (
              <div className="rounded-2xl bg-amber-50 text-amber-700 px-4 py-3 text-sm">
                当前活动暂未开放报名，你仍然可以先查看活动详情。
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 text-red-600 px-4 py-3 text-sm">{error}</div>
            )}

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">基础信息</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="姓名" required value={form.full_name} onChange={value => setForm(prev => ({ ...prev, full_name: value }))} />
                <InputField label="性别" required value={form.gender} onChange={value => setForm(prev => ({ ...prev, gender: value }))} />
                <InputField label="年龄" value={form.age} onChange={value => setForm(prev => ({ ...prev, age: value }))} type="number" />
                <InputField label="所属教会/团契" required value={form.church_name} onChange={value => setForm(prev => ({ ...prev, church_name: value }))} />
                <InputField label="手机号" required value={form.phone} onChange={value => setForm(prev => ({ ...prev, phone: value }))} />
                <InputField label="微信号" value={form.wechat_id} onChange={value => setForm(prev => ({ ...prev, wechat_id: value }))} />
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_first_time}
                  onChange={eventValue => setForm(prev => ({ ...prev, is_first_time: eventValue.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300"
                />
                这是我第一次参加这个活动
              </label>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">备注</label>
                <textarea
                  value={form.remark}
                  onChange={eventValue => setForm(prev => ({ ...prev, remark: eventValue.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="可以补充同行信息、特别说明等"
                />
              </div>
            </section>

            {fields.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">补充问题</h2>
                <div className="space-y-5">
                  {fields.map(field => {
                    const options = parseFieldOptions(field.options)
                    const currentValue = answers[field.field_key]

                    return (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {field.label}
                          {field.is_required ? ' *' : ''}
                        </label>

                        {(field.field_type === 'text' || field.field_type === 'textarea') && (
                          field.field_type === 'textarea' ? (
                            <textarea
                              value={typeof currentValue === 'string' ? currentValue : ''}
                              onChange={eventValue => updateAnswer(field.field_key, eventValue.target.value)}
                              rows={4}
                              placeholder={field.placeholder || ''}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <input
                              value={typeof currentValue === 'string' ? currentValue : ''}
                              onChange={eventValue => updateAnswer(field.field_key, eventValue.target.value)}
                              placeholder={field.placeholder || ''}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )
                        )}

                        {(field.field_type === 'select' || field.field_type === 'radio') && (
                          <div className="space-y-2">
                            {options.map(option => (
                              <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                                <input
                                  type="radio"
                                  name={field.field_key}
                                  checked={currentValue === option}
                                  onChange={() => updateAnswer(field.field_key, option)}
                                  className="h-4 w-4 border-slate-300"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        )}

                        {field.field_type === 'checkbox' && (
                          <div className="space-y-2">
                            {options.map(option => {
                              const checkboxValue = Array.isArray(currentValue) ? currentValue : []

                              return (
                                <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={checkboxValue.includes(option)}
                                    onChange={eventValue => {
                                      if (eventValue.target.checked) {
                                        updateAnswer(field.field_key, [...checkboxValue, option])
                                      } else {
                                        updateAnswer(field.field_key, checkboxValue.filter(item => item !== option))
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-slate-300"
                                  />
                                  {option}
                                </label>
                              )
                            })}
                          </div>
                        )}

                        {field.field_type === 'boolean' && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateAnswer(field.field_key, true)}
                              className={`px-4 py-2 rounded-full border text-sm ${
                                currentValue === true
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              是
                            </button>
                            <button
                              type="button"
                              onClick={() => updateAnswer(field.field_key, false)}
                              className={`px-4 py-2 rounded-full border text-sm ${
                                currentValue === false
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              否
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !canRegister}
                className="px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '提交中...' : '提交报名'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        required={required}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
