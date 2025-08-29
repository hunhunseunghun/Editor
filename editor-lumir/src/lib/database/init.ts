import { initializeDatabase } from './utils';

/**
 * 애플리케이션 시작 시 데이터베이스 초기화
 * 개발 환경에서만 실행되도록 설정
 */
export async function initializeAppDatabase() {
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV === 'development') {
    try {
      await initializeDatabase();
    } catch {
      // 에러 처리
    }
  }
}

// 서버 시작 시 자동 실행 (선택적)
if (typeof window === 'undefined') {
  // 서버 사이드에서만 실행
  initializeAppDatabase().catch(() => {
    // 에러 처리
  });
}
