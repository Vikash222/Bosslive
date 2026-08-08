'use client'

import { useEffect, useState } from 'react'
import { getTranslations, Language } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>('en')
  useEffect(() => { const saved = localStorage.getItem('bosslive-language') as Language | null; if (saved && ['en','hi','pa'].includes(saved)) setLanguage(saved) }, [])
  function change(value: Language) { setLanguage(value); localStorage.setItem('bosslive-language', value); window.dispatchEvent(new CustomEvent('bosslive-language-change', { detail: value })) }
  const t = getTranslations(language)
  return <label style={{display:'inline-flex',alignItems:'center',gap:8}} aria-label="Language"><span style={{fontSize:12}}>{language==='en'?'EN':language==='hi'?'हिं':'ਪੰ'}</span><select value={language} onChange={e=>change(e.target.value as Language)}><option value="en">English</option><option value="hi">हिन्दी</option><option value="pa">ਪੰਜਾਬੀ</option></select><span className="sr-only">{t.dashboard}</span></label>
}
