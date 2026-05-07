import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getEventManagerState, parseFieldOptions, slugify, type EventFieldRecord, type EventRecord } from '../../lib/events'

type EditorFormState = {
  title: string
  slug: string
  subtitle: string
  cover_image_url: string
  gallery_images: string
  summary: string
  content: string
  location: string
  starts_at: string
  ends_at: string
  registration_starts_at: string
  registration_ends_at: string
  capacity: string
  status: EventRecord['status']
  is_public: boolean
}

type CustomFieldDraft = {
  id?: string
  tempId: string
  field_key: string
  label: string
  field_type: EventFieldRecord['field_type']
  is_required: boolean
  sort_order: number
  optionsText: string
  placeholder: string
  is_active: boolean
}

type ProfileOption = {
  id: string
  username: string | null
}

type OrganizerRow = {
  id: string
  user_id: string
  role: 'owner' | 'editor'
}

const initialForm: EditorFormState = {
  title: '',
  slug: '',
  subtitle: '',
  cover_image_url: '',
  gallery_images: '',
  summary: '',
  content: '',
  location: '',
  starts_at: '',
  ends_at: '',
  registration_starts_at: '',
  registration_ends_at: '',
  capacity: '',
  status: 'draft',
  is_public: true,
}

export default function AdminEventEditor() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const isNew = !eventId
  const [form, setForm] = useState<EditorFormState>(initialForm)
  const [customFields, setCustomFields] = useState<CustomFieldDraft[]>([])
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [organizers, setOrganizers] = useState<OrganizerRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authorized, setAuthorized] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('')
  const [selectedOrganizerRole, setSelectedOrganizerRole] = useState<'owner' | 'editor'>('editor')

  const organizerProfileMap = useMemo(
    () => Object.fromEntries(profiles.map(profile => [profile.id, profile.username || '未命名用户'])),
    [profiles]
  )

  useEffect(() => {
    void fetchEditorData()
  }, [eventId])

  const fetchEditorData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const managerState = await getEventManagerState()
      setCurrentUserId(managerState.userId)
      setIsAdmin(managerState.isAdmin)

      if (!managerState.userId) {
        navigate('/login')
        return
      }

      if (isNew && !managerState.isAdmin) {
        setAuthorized(false)
        return
      }

      const profileQuery = managerState.isAdmin
        ? supabase.from('profiles').select('id, username').order('username', { ascending: true })
        : Promise.resolve({ data: [], error: null })

      if (isNew) {
        const profileResult = await profileQuery
        if ('error' in profileResult && profileResult.error) {
          throw profileResult.error
        }
        setProfiles((profileResult.data as ProfileOption[]) || [])
        setAuthorized(true)
        setForm(initialForm)
        setCustomFields([])
        setOrganizers([])
        return
      }

      const organizersQuery = managerState.isAdmin
        ? supabase.from('event_organizers').select('id, user_id, role').eq('event_id', eventId).order('created_at', { ascending: true })
        : Promise.resolve({ data: [], error: null })

      const [eventResult, fieldsResult, organizersResult, profileResult] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('event_form_fields').select('*').eq('event_id', eventId).order('sort_order', { ascending: true }),
        organizersQuery,
        profileQuery,
      ])

      if (eventResult.error) {
        setAuthorized(false)
        return
      }

      if (fieldsResult.error) {
        throw fieldsResult.error
      }

      if ('error' in organizersResult && organizersResult.error) {
        throw organizersResult.error
      }

      if ('error' in profileResult && profileResult.error) {
        throw profileResult.error
      }

      const eventData = eventResult.data as EventRecord

      setAuthorized(true)
      setForm({
        title: eventData.title || '',
        slug: eventData.slug || '',
        subtitle: eventData.subtitle || '',
        cover_image_url: eventData.cover_image_url || '',
        gallery_images: Array.isArray(eventData.gallery_images) ? eventData.gallery_images.join('\n') : '',
        summary: eventData.summary || '',
        content: eventData.content || '',
        location: eventData.location || '',
        starts_at: toDateTimeInput(eventData.starts_at),
        ends_at: toDateTimeInput(eventData.ends_at),
        registration_starts_at: toDateTimeInput(eventData.registration_starts_at),
        registration_ends_at: toDateTimeInput(eventData.registration_ends_at),
        capacity: eventData.capacity ? String(eventData.capacity) : '',
        status: eventData.status,
        is_public: eventData.is_public,
      })
      setCustomFields(
        ((fieldsResult.data as EventFieldRecord[]) || []).map((field, index) => ({
          id: field.id,
          tempId: field.id,
          field_key: field.field_key,
          label: field.label,
          field_type: field.field_type,
          is_required: field.is_required,
          sort_order: field.sort_order ?? index,
          optionsText: parseFieldOptions(field.options).join(', '),
          placeholder: field.placeholder || '',
          is_active: field.is_active,
        }))
      )
      setOrganizers((organizersResult.data as OrganizerRow[]) || [])
      setProfiles((profileResult.data as ProfileOption[]) || [])
    } catch (error) {
      console.error('Error fetching editor data:', error)
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentUserId) {
      return
    }

    if (!form.title.trim()) {
      setMessage('活动标题不能为空。')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const slug = slugify(form.slug || form.title)
      const payload = {
        slug,
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        gallery_images: form.gallery_images
          .split('\n')
          .map(item => item.trim())
          .filter(Boolean),
        summary: form.summary.trim() || null,
        content: form.content.trim() || null,
        location: form.location.trim() || null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        registration_starts_at: form.registration_starts_at ? new Date(form.registration_starts_at).toISOString() : null,
        registration_ends_at: form.registration_ends_at ? new Date(form.registration_ends_at).toISOString() : null,
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
        is_public: form.is_public,
      }

      let savedEventId = eventId

      if (isNew) {
        const { data, error } = await supabase
          .from('events')
          .insert({
            ...payload,
            created_by: currentUserId,
          })
          .select('id')
          .single()

        if (error) {
          throw error
        }

        savedEventId = data.id
      } else {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', eventId)

        if (error) {
          throw error
        }
      }

      if (!savedEventId) {
        throw new Error('Missing event id')
      }

      const { error: deleteFieldsError } = await supabase
        .from('event_form_fields')
        .delete()
        .eq('event_id', savedEventId)

      if (deleteFieldsError) {
        throw deleteFieldsError
      }

      const fieldRows = customFields
        .filter(field => field.label.trim())
        .map((field, index) => ({
          event_id: savedEventId,
          field_key: slugify(field.field_key || field.label || `field-${index + 1}`),
          label: field.label.trim(),
          field_type: field.field_type,
          is_required: field.is_required,
          sort_order: index,
          options: field.optionsText
            .split(',')
            .map(item => item.trim())
            .filter(Boolean),
          placeholder: field.placeholder.trim() || null,
          is_active: field.is_active,
        }))

      if (fieldRows.length > 0) {
        const { error: insertFieldsError } = await supabase
          .from('event_form_fields')
          .insert(fieldRows)

        if (insertFieldsError) {
          throw insertFieldsError
        }
      }

      setMessage('活动已保存。')

      if (isNew) {
        navigate(`/admin/events/${savedEventId}`, { replace: true })
      } else {
        await fetchEditorData()
      }
    } catch (error: any) {
      console.error('Error saving event:', error)
      if (error?.code === '23505') {
        setMessage('slug 已存在，请修改活动链接标识。')
      } else {
        setMessage('保存失败，请稍后重试。')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAddOrganizer = async () => {
    if (!eventId || !selectedOrganizerId) {
      return
    }

    try {
      const { error } = await supabase
        .from('event_organizers')
        .insert({
          event_id: eventId,
          user_id: selectedOrganizerId,
          role: selectedOrganizerRole,
        })

      if (error) {
        throw error
      }

      setSelectedOrganizerId('')
      await fetchEditorData()
    } catch (error) {
      console.error('Error adding organizer:', error)
      setMessage('添加组织者失败，请检查是否重复添加。')
    }
  }

  const handleRemoveOrganizer = async (organizerId: string) => {
    try {
      const { error } = await supabase
        .from('event_organizers')
        .delete()
        .eq('id', organizerId)

      if (error) {
        throw error
      }

      await fetchEditorData()
    } catch (error) {
      console.error('Error removing organizer:', error)
      setMessage('移除组织者失败。')
    }
  }

  const addCustomField = () => {
    setCustomFields(prev => [
      ...prev,
      {
        tempId: `new-${Date.now()}`,
        field_key: '',
        label: '',
        field_type: 'text',
        is_required: false,
        sort_order: prev.length,
        optionsText: '',
        placeholder: '',
        is_active: true,
      },
    ])
  }

  const updateCustomField = (tempId: string, patch: Partial<CustomFieldDraft>) => {
    setCustomFields(prev => prev.map(field => (
      field.tempId === tempId ? { ...field, ...patch } : field
    )))
  }

  const removeCustomField = (tempId: string) => {
    setCustomFields(prev => prev.filter(field => field.tempId !== tempId))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">你暂时无权编辑这个活动</h1>
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
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate('/admin/events')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            返回后台列表
          </button>
          {!isNew && (
            <button
              onClick={() => navigate(`/admin/events/${eventId}/registrations`)}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              查看报名数据
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{isNew ? '新建活动' : '编辑活动'}</h1>
          <p className="text-slate-600">先把基本信息、活动介绍和报名字段配置好，保存后前台就可以直接使用。</p>
        </div>

        {message && (
          <div className="rounded-2xl bg-blue-50 text-blue-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">基本信息</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <TextInput label="活动标题" value={form.title} onChange={value => setForm(prev => ({ ...prev, title: value, slug: prev.slug || slugify(value) }))} />
            <TextInput label="活动链接标识 slug" value={form.slug} onChange={value => setForm(prev => ({ ...prev, slug: slugify(value) }))} />
            <TextInput label="副标题" value={form.subtitle} onChange={value => setForm(prev => ({ ...prev, subtitle: value }))} />
            <TextInput label="地点" value={form.location} onChange={value => setForm(prev => ({ ...prev, location: value }))} />
            <TextInput label="封面图 URL" value={form.cover_image_url} onChange={value => setForm(prev => ({ ...prev, cover_image_url: value }))} />
            <TextInput label="人数上限" value={form.capacity} onChange={value => setForm(prev => ({ ...prev, capacity: value }))} type="number" />
            <TextInput label="活动开始时间" value={form.starts_at} onChange={value => setForm(prev => ({ ...prev, starts_at: value }))} type="datetime-local" />
            <TextInput label="活动结束时间" value={form.ends_at} onChange={value => setForm(prev => ({ ...prev, ends_at: value }))} type="datetime-local" />
            <TextInput label="报名开始时间" value={form.registration_starts_at} onChange={value => setForm(prev => ({ ...prev, registration_starts_at: value }))} type="datetime-local" />
            <TextInput label="报名截止时间" value={form.registration_ends_at} onChange={value => setForm(prev => ({ ...prev, registration_ends_at: value }))} type="datetime-local" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">状态</label>
              <select
                value={form.status}
                onChange={event => setForm(prev => ({ ...prev, status: event.target.value as EventRecord['status'] }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">草稿</option>
                <option value="open">报名中</option>
                <option value="closed">已截止</option>
                <option value="archived">已归档</option>
              </select>
            </div>
            <label className="flex items-center gap-3 pt-9 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={event => setForm(prev => ({ ...prev, is_public: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              公开展示在活动列表页
            </label>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">介绍内容</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">活动简介</label>
            <textarea
              value={form.summary}
              onChange={event => setForm(prev => ({ ...prev, summary: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">详细介绍</label>
            <textarea
              value={form.content}
              onChange={event => setForm(prev => ({ ...prev, content: event.target.value }))}
              rows={10}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">活动展示图 URL 列表</label>
            <textarea
              value={form.gallery_images}
              onChange={event => setForm(prev => ({ ...prev, gallery_images: event.target.value }))}
              rows={4}
              placeholder="每行一个图片 URL"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">自定义字段</h2>
              <p className="text-sm text-slate-500 mt-1">固定字段会默认存在，这里只需要补充少量个性化问题。</p>
            </div>
            <button
              type="button"
              onClick={addCustomField}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              添加问题
            </button>
          </div>

          {customFields.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              暂时还没有自定义问题。
            </div>
          ) : (
            <div className="space-y-4">
              {customFields.map((field, index) => (
                <div key={field.tempId} className="rounded-3xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-slate-900">问题 {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCustomField(field.tempId)}
                      className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <TextInput label="字段 key" value={field.field_key} onChange={value => updateCustomField(field.tempId, { field_key: value })} />
                    <TextInput label="显示标题" value={field.label} onChange={value => updateCustomField(field.tempId, { label: value })} />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">题型</label>
                      <select
                        value={field.field_type}
                        onChange={event => updateCustomField(field.tempId, { field_type: event.target.value as EventFieldRecord['field_type'] })}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">单行文本</option>
                        <option value="textarea">多行文本</option>
                        <option value="select">单选下拉</option>
                        <option value="radio">单选题</option>
                        <option value="checkbox">多选题</option>
                        <option value="boolean">是否题</option>
                      </select>
                    </div>
                    <TextInput label="占位提示" value={field.placeholder} onChange={value => updateCustomField(field.tempId, { placeholder: value })} />
                  </div>

                  {(field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'checkbox') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">选项</label>
                      <input
                        value={field.optionsText}
                        onChange={event => updateCustomField(field.tempId, { optionsText: event.target.value })}
                        placeholder="使用英文逗号分隔，例如：是, 否"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={event => updateCustomField(field.tempId, { is_required: event.target.checked })}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      必填
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={field.is_active}
                        onChange={event => updateCustomField(field.tempId, { is_active: event.target.checked })}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      启用
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {isAdmin && !isNew && (
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
            <h2 className="text-xl font-semibold text-slate-900">组织者管理</h2>
            <div className="grid md:grid-cols-[1fr_180px_auto] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择用户</label>
                <select
                  value={selectedOrganizerId}
                  onChange={event => setSelectedOrganizerId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择组织者</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.username || profile.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">角色</label>
                <select
                  value={selectedOrganizerRole}
                  onChange={event => setSelectedOrganizerRole(event.target.value as 'owner' | 'editor')}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="editor">编辑者</option>
                  <option value="owner">负责人</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddOrganizer}
                className="px-5 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                添加
              </button>
            </div>

            {organizers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                还没有分配组织者。
              </div>
            ) : (
              <div className="space-y-3">
                {organizers.map(organizer => (
                  <div key={organizer.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-900">
                        {organizerProfileMap[organizer.user_id] || organizer.user_id}
                      </div>
                      <div className="text-sm text-slate-500">
                        {organizer.role === 'owner' ? '负责人' : '编辑者'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOrganizer(organizer.id)}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存活动'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function toDateTimeInput(value?: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}
