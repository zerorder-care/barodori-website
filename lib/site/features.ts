export const siteFeatures = {
  // 후기 데이터가 실제 운영 데이터로 교체될 때까지 공개 노출을 막습니다.
  reviews: false,
  // 두상 테스트 상단 탭 — 법률 확정 문구 배포, 계측 배포, 모델 URL 설정의
  // 세 조건이 갖춰지면 켭니다 (공유 플로우 스펙 §7).
  headTestTab: false,
} as const
