import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key"); // 업로드할 파일명
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: "application/octet-stream", // 필요 시 변경 (image/jpeg 등)
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // presigned URL 유효시간 60초

  // 업로드 후 접근할 공개 URL 생성
  const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return NextResponse.json({
    presignedUrl,
    publicUrl,
    key,
  });
}
/**
 * 사용 예시
 *
 * // 1. presigned URL과 공개 URL 요청
 * const res = await fetch(`/api/s3/presigned?key=myfile.png`);
 * const { presignedUrl, publicUrl, key } = await res.json();
 *
 * // 2. presigned URL로 파일 업로드
 * await fetch(presignedUrl, {
 *   method: "PUT",
 *   headers: { "Content-Type": "image/png" },
 *   body: file,
 * });
 *
 * // 3. 업로드 완료 후 publicUrl로 파일에 접근 가능
 * // 예: https://lumir-file-server-bucket.s3.ap-northeast-2.amazonaws.com/myfile.png
 *
 * Response 형태:
 * {
 *   presignedUrl: "https://lumir-file-server-bucket.s3.ap-northeast-2.amazonaws.com/myfile.png?X-Amz-Algorithm=...",
 *   publicUrl: "https://lumir-file-server-bucket.s3.ap-northeast-2.amazonaws.com/myfile.png",
 *   key: "myfile.png"
 * }
 */
