// clsx와 tailwind-merge를 사용한 className 유틸리티
// 사용자가 직접 설치하도록 권장하거나, 간단한 버전 제공

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
