import { cn } from '../lib/utils'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface EmptyProps {
  className?: string
  message?: string
}

export default function Empty({ className, message }: EmptyProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="relative mb-8 transform hover:scale-105 transition-transform duration-300">
        <svg
          width="200"
          height="160"
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Background decoration - Sun/Moon */}
          <circle cx="160" cy="40" r="15" fill="#FCD34D" fillOpacity="0.8" />
          
          {/* Legs */}
          <path d="M70 120L70 145" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
          <path d="M90 120L90 145" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
          <path d="M110 120L110 145" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
          <path d="M130 120L130 145" stroke="#111827" strokeWidth="6" strokeLinecap="round" />

          {/* Body - Fluffy Cloud Shape */}
          <path
            d="M50 100C40 100 30 90 30 75C30 65 35 58 42 55C45 40 58 30 75 30C85 30 95 35 100 42C108 35 120 32 130 40C145 35 160 45 165 60C175 65 175 80 165 90C170 105 160 120 145 120L60 120C45 120 40 110 50 100Z"
            fill="white"
            stroke="#E5E7EB"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          
          {/* Head */}
          <ellipse cx="60" cy="85" rx="22" ry="18" fill="#111827" />
          
          {/* Ears */}
          <ellipse cx="40" cy="88" rx="10" ry="5" fill="#111827" transform="rotate(-30 40 88)" />
          <ellipse cx="80" cy="88" rx="10" ry="5" fill="#111827" transform="rotate(30 80 88)" />

          {/* Face Details */}
          <circle cx="53" cy="82" r="2" fill="white" />
          <circle cx="67" cy="82" r="2" fill="white" />
          
          {/* Cute Blush */}
          <circle cx="48" cy="90" r="3" fill="#FCA5A5" fillOpacity="0.6" />
          <circle cx="72" cy="90" r="3" fill="#FCA5A5" fillOpacity="0.6" />
          
          {/* Sparkles */}
          <path d="M170 30L172 25M175 35L178 32" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="text-xl font-medium text-gray-900 mb-3 px-4 max-w-sm mx-auto">
        {message || t('feed.empty_state')}
      </h3>
      
      <button 
        onClick={() => navigate('/create')}
        className="mt-4 px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
      >
        <span>{t('feed.create_post')}</span>
      </button>
    </div>
  )
}
