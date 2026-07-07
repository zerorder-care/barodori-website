import type { Locale } from '@/lib/i18n/config'

export type FaqCategory = string

export type FaqItem = {
  id: string
  category: FaqCategory
  question: string
  answer: string
}

type FaqCategoryOption = {
  value: string
  label: string
}

const faqCategoriesByLocale: Record<Locale, FaqCategoryOption[]> = {
  ko: [
    { value: 'all', label: '전체' },
    { value: 'general', label: '서비스 일반' },
    { value: 'measurement', label: '기록·리포트' },
    { value: 'payment', label: '비용·결제' },
    { value: 'privacy', label: '개인정보·보안' },
    { value: 'technical', label: '기술 문제' },
  ],
  en: [
    { value: 'all', label: 'All' },
    { value: 'general', label: 'General' },
    { value: 'measurement', label: 'Records and reports' },
    { value: 'payment', label: 'Pricing and payment' },
    { value: 'privacy', label: 'Privacy and security' },
    { value: 'technical', label: 'Technical issues' },
  ],
}

const faqItemsByLocale: Record<Locale, FaqItem[]> = {
  ko: [
    {
      id: 'faq-1',
      category: 'general',
      question: '바로도리는 어떤 서비스인가요?',
      answer:
        '바로도리는 집에서 한 아기 운동 기록, 영유아 홈케어 루틴, 물리치료 방문 기록, 아이 반응을 한곳에 남기고 달력·리포트로 확인할 수 있도록 돕는 아이 운동 다이어리 앱이에요.',
    },
    {
      id: 'faq-2',
      category: 'general',
      question: '몇 개월부터 사용 가능한가요?',
      answer:
        '0~12개월 영유아 보호자를 주요 대상으로 설계하고 있어요. 아이의 상태나 진료 이력에 따라 사용 전 담당 병원과 상담하는 것을 권장해요.',
    },
    {
      id: 'faq-3',
      category: 'measurement',
      question: '상태 기록은 어떻게 참고해야 하나요?',
      answer:
        '바로도리의 기록 기능은 보호자의 관찰과 정리를 돕기 위한 보조 도구예요. 아이 상태에 대한 최종 판단은 병원 진료를 기준으로 해주세요.',
    },
    {
      id: 'faq-4',
      category: 'measurement',
      question: '사진은 어떻게 촬영해야 하나요?',
      answer:
        '앱의 가이드에 맞춰 아이가 편안한 상태에서 촬영해주세요. 조명, 자세, 보호자 보조 여부가 결과 품질에 영향을 줄 수 있어요.',
    },
    {
      id: 'faq-5',
      category: 'payment',
      question: '이용 요금이 얼마인가요?',
      answer:
        '베타/알림 신청과 스토어 오픈 이후 이용 방식은 운영 정책 확정 후 홈페이지와 앱에서 안내드릴게요.',
    },
    {
      id: 'faq-6',
      category: 'privacy',
      question: '아이 사진은 안전하게 보관되나요?',
      answer:
        '아이 사진과 개인정보는 서비스 제공에 필요한 범위에서만 처리되며, 상세한 보관 기간과 처리 방식은 개인정보처리방침을 따라요.',
    },
    {
      id: 'faq-7',
      category: 'technical',
      question: '어떤 기기에서 사용할 수 있나요?',
      answer:
        '스토어 링크가 준비되면 iOS와 Android 지원 범위를 스토어 안내와 함께 공지할게요.',
    },
  ],
  en: [
    {
      id: 'faq-1',
      category: 'general',
      question: 'What is Barodori?',
      answer:
        'Barodori is a baby exercise diary app that helps caregivers record home-care routines, therapy visits, and child responses, then review them through calendars and reports.',
    },
    {
      id: 'faq-2',
      category: 'general',
      question: 'What ages is it designed for?',
      answer:
        "Barodori is designed mainly for caregivers of babies from 0 to 12 months. Depending on your child's condition and care history, consult your hospital before use.",
    },
    {
      id: 'faq-3',
      category: 'measurement',
      question: 'How should I use condition records?',
      answer:
        "Barodori records are supportive notes for caregiver observation and organization. Final judgment about your child's condition should be based on medical consultation.",
    },
    {
      id: 'faq-4',
      category: 'measurement',
      question: 'How should I take photos?',
      answer:
        'Follow the in-app guide and take photos while your child is comfortable. Lighting, posture, and caregiver support can affect record quality.',
    },
    {
      id: 'faq-5',
      category: 'payment',
      question: 'How much does it cost?',
      answer:
        'Beta, launch updates, and post-launch pricing will be announced on the website and in the app after the operation policy is finalized.',
    },
    {
      id: 'faq-6',
      category: 'privacy',
      question: "Are my child's photos stored safely?",
      answer:
        'Child photos and personal data are processed only as needed to provide the service. Detailed retention periods and processing methods follow the privacy policy.',
    },
    {
      id: 'faq-7',
      category: 'technical',
      question: 'Which devices are supported?',
      answer:
        'When store links are ready, iOS and Android support details will be announced with the store information.',
    },
  ],
}

export const faqCategories = faqCategoriesByLocale.ko
export const faqItems = faqItemsByLocale.ko

export function getFaqCategories(locale: Locale): FaqCategoryOption[] {
  return faqCategoriesByLocale[locale]
}

export function getFaqItems(locale: Locale): FaqItem[] {
  return faqItemsByLocale[locale]
}
