export const siteFeatures = {
  // 후기 데이터가 실제 운영 데이터로 교체될 때까지 공개 노출을 막습니다.
  reviews: false,
  // 두상 테스트 상단 탭 — 법률 검토 통과(2026-08-13)와 계측 배포로 노출 조건 충족.
  headTestTab: true,
} as const
