export type Language = 'en' | 'hi' | 'pa'

export const translations = {
  en: { dashboard:'Dashboard', myTeam:'My Team', matches:'Matches', players:'Players', live:'Live', createMatch:'Create Match', scorecard:'Scorecard', playingXI:'Playing XI', requests:'Requests', finishMatch:'Finish Match' },
  hi: { dashboard:'डैशबोर्ड', myTeam:'मेरी टीम', matches:'मैच', players:'खिलाड़ी', live:'लाइव', createMatch:'मैच बनाएं', scorecard:'स्कोरकार्ड', playingXI:'प्लेइंग XI', requests:'रिक्वेस्ट', finishMatch:'मैच समाप्त करें' },
  pa: { dashboard:'ਡੈਸ਼ਬੋਰਡ', myTeam:'ਮੇਰੀ ਟੀਮ', matches:'ਮੈਚ', players:'ਖਿਡਾਰੀ', live:'ਲਾਈਵ', createMatch:'ਮੈਚ ਬਣਾਓ', scorecard:'ਸਕੋਰਕਾਰਡ', playingXI:'ਪਲੇਇੰਗ XI', requests:'ਬੇਨਤੀਆਂ', finishMatch:'ਮੈਚ ਖਤਮ ਕਰੋ' }
} as const

export function getTranslations(language: Language = 'en') { return translations[language] }
