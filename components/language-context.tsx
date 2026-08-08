'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getTranslations, Language } from '@/lib/i18n'

type Ctx={language:Language;setLanguage:(language:Language)=>void;t:ReturnType<typeof getTranslations>}
const LanguageContext=createContext<Ctx|null>(null)
export function LanguageProvider({children}:{children:React.ReactNode}){const [language,setLanguageState]=useState<Language>('en');useEffect(()=>{const saved=localStorage.getItem('bosslive-language') as Language|null;if(saved&&['en','hi','pa'].includes(saved))setLanguageState(saved)},[]);const setLanguage=(v:Language)=>{setLanguageState(v);localStorage.setItem('bosslive-language',v)};const value=useMemo(()=>({language,setLanguage,t:getTranslations(language)}),[language]);return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>}
export function useLanguage(){const value=useContext(LanguageContext);if(!value)throw new Error('useLanguage must be used inside LanguageProvider');return value}
