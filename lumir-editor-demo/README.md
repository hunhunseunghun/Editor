# Lumir Editor Demo

@kingdoo/editor를 사용한 데모 프로젝트입니다.

## 기능

- 이미지 전용 BlockNote 리치 텍스트 에디터
- S3 업로드 지원
- 최적화된 로딩 스피너
- Vercel 배포 준비 완료

## 설치 및 실행

```bash
npm install
npm run dev
```

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
```

## Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `S3_BUCKET_NAME`
3. 배포 실행

## 사용된 패키지

- [@kingdoo/editor](https://www.npmjs.com/package/@kingdoo/editor) - 메인 에디터 컴포넌트
- Next.js 15 - React 프레임워크
- Tailwind CSS - 스타일링
- AWS SDK - S3 업로드

## 라이센스

MIT
