import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [needsActivation, setNeedsActivation] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error

        // Record login log
        if (data.user) {
          await supabase.from('login_logs').insert({
            user_id: data.user.id
          })
        }

        await checkActivation()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0]
            }
          }
        })
        if (error) throw error
        // Signup successful, check activation
        await checkActivation()
      }
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  const checkActivation = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_activated')
      .eq('id', user.id)
      .single()

    if (profile && profile.is_activated) {
      navigate('/', { replace: true })
      window.location.reload()
    } else {
      setNeedsActivation(true)
    }
  }

  const redeemCode = async () => {
    setLoading(true)
    setErrorMsg('')
    
    try {
      const { data, error } = await supabase.rpc('redeem_invitation', {
        invite_code: invitationCode
      })
      
      if (error) throw error
      if (!data) throw new Error('Invalid or used invitation code')
      
      navigate('/')
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out opacity-100"
        style={{
          backgroundImage: `url('https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=minimalist%20landscape%2C%20bright%20sky%20with%20soft%20holy%20light%2C%20distant%20mountains%2C%20subtle%20silhouette%20of%20a%20modern%20church%20with%20a%20cross%20in%20the%20distance%2C%20bokeh%2C%20blurred%20background%2C%20nordic%20style%2C%20japanese%20minimalist%2C%20white%20and%20light%20blue%20tones%2C%20high%20key%20photography%2C%20peaceful%2C%20hopeful%20atmosphere&image_size=landscape_16_9')`,
          filter: 'blur(8px) contrast(0.9) brightness(1.1)',
          transform: 'scale(1.1)' 
        }}
      />
      
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher className="bg-white/80 backdrop-blur-md shadow-sm hover:bg-white" />
      </div>

      {/* Gradient Overlay for better text contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/40 via-white/20 to-transparent backdrop-blur-[2px]" />

      {/* Card Content */}
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 border border-white/60 relative mx-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-light text-gray-900 tracking-tight font-serif">
            {needsActivation ? t('login.invitation') : (isLogin ? t('login.welcome_back') : t('login.join_us'))}
          </h2>
          <p className="text-xs text-gray-500 font-medium tracking-[0.2em] uppercase">
            {t('login.share_moments')}
          </p>
        </div>

        {/* Activation Step */}
        {needsActivation ? (
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">{t('login.invitation_code')}</label>
              <input
                id="code"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                type="text"
                required
                className="appearance-none block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 focus:bg-white transition-all duration-200 text-sm placeholder-gray-400"
                placeholder={t('login.invitation_code')}
              />
            </div>
            <button
              onClick={redeemCode}
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#1a1a1a] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('login.verifying')}
                </span>
              ) : t('login.enter')}
            </button>
          </div>
        ) : (
          /* Login/Register Step */
          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email-address" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">{t('login.email')}</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 focus:bg-white transition-all duration-200 text-sm placeholder-gray-400"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">{t('login.password')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 focus:bg-white transition-all duration-200 text-sm placeholder-gray-400 tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-500 text-xs font-medium text-center bg-red-50/80 backdrop-blur-sm py-2.5 rounded-lg border border-red-100 animate-pulse">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#1a1a1a] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.processing')}
                  </span>
                ) : (isLogin ? t('login.sign_in') : t('login.sign_up'))}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-all border-b border-transparent hover:border-gray-300 pb-0.5"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? t('login.no_account') : t('login.has_account')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
