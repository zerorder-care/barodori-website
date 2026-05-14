export type FaqCategory = string

export type FaqItem = {
  id: string
  category: FaqCategory
  question: string
  answer: string
}

export const faqCategories = [
  { value: 'all', label: '전체' },
  { value: 'general', label: '서비스 일반' },
  { value: 'measurement', label: '기록·리포트' },
  { value: 'payment', label: '비용·결제' },
  { value: 'privacy', label: '개인정보·보안' },
  { value: 'technical', label: '기술 문제' },
] as const

export const faqItems: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: '바로도리는 어떤 서비스인가요?',
    answer:
      '바로도리는 영유아 사경·사두 관리에 어려움을 느끼는 보호자가 아이 상태를 기록하고 가정 운동 루틴을 이어갈 수 있도록 돕는 웰니스 앱입니다.',
  },
  {
    id: 'faq-2',
    category: 'general',
    question: '몇 개월부터 사용 가능한가요?',
    answer:
      '0~12개월 영유아 보호자를 주요 대상으로 설계하고 있습니다. 아이의 상태나 진료 이력에 따라 사용 전 담당 병원과 상담하는 것을 권장합니다.',
  },
  {
    id: 'faq-3',
    category: 'measurement',
    question: '상태 기록은 어떻게 참고해야 하나요?',
    answer:
      '바로도리의 기록 기능은 보호자의 관찰과 정리를 돕기 위한 보조 도구입니다. 아이 상태에 대한 최종 판단은 병원 진료를 기준으로 해주세요.',
  },
  {
    id: 'faq-4',
    category: 'measurement',
    question: '사진은 어떻게 촬영해야 하나요?',
    answer:
      '앱의 가이드에 맞춰 아이가 편안한 상태에서 촬영해주세요. 조명, 자세, 보호자 보조 여부가 결과 품질에 영향을 줄 수 있습니다.',
  },
  {
    id: 'faq-5',
    category: 'payment',
    question: '이용 요금이 얼마인가요?',
    answer:
      '베타 기간의 이용 방식과 정식 출시 후 요금제는 운영 정책 확정 후 홈페이지와 앱에서 안내드릴 예정입니다.',
  },
  {
    id: 'faq-6',
    category: 'privacy',
    question: '아이 사진은 안전하게 보관되나요?',
    answer:
      '아이 사진과 개인정보는 서비스 제공에 필요한 범위에서만 처리되며, 상세한 보관 기간과 처리 방식은 개인정보처리방침에 따릅니다.',
  },
  {
    id: 'faq-7',
    category: 'technical',
    question: '어떤 기기에서 사용할 수 있나요?',
    answer:
      '정식 출시 시 iOS와 Android 지원 범위를 스토어 안내와 함께 공지할 예정입니다.',
  },
]
