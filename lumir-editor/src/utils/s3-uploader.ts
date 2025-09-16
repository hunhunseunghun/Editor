export interface S3UploaderConfig {
  apiEndpoint: string; // '/api/s3/presigned'(필수)
  env: "production" | "development"; // 환경 (필수)
  author: "admin" | "user"; // 작성자 타입 (필수)
  userId: string; // 사용자 ID (필수)
  path: string; // 파일 경로 (필수)
}

export const createS3Uploader = (config: S3UploaderConfig) => {
  const { apiEndpoint, env, author, userId, path } = config;

  // 필수 파라미터 검증
  if (!apiEndpoint || apiEndpoint.trim() === "") {
    throw new Error(
      "apiEndpoint is required for S3 upload. Please provide a valid API endpoint."
    );
  }

  if (!env) {
    throw new Error("env is required. Must be 'development' or 'production'.");
  }

  if (!author) {
    throw new Error("author is required. Must be 'admin' or 'user'.");
  }

  if (!userId || userId.trim() === "") {
    throw new Error("userId is required and cannot be empty.");
  }

  if (!path || path.trim() === "") {
    throw new Error("path is required and cannot be empty.");
  }

  // 계층 구조 파일명 생성 함수
  const generateHierarchicalFileName = (file: File): string => {
    const now = new Date();

    // 날짜 (yyyy-mm-dd)
    const date = now.toISOString().split("T")[0];

    // 시간 (hh:mm:ss)
    const time = now.toTimeString().split(" ")[0];

    // 파일명
    const filename = file.name;

    // {env}/{author}/{userId}/{path}/{date}/{time}/{filename}
    return `${env}/${author}/${userId}/${path}/${date}/${time}/${filename}`;
  };

  return async (file: File): Promise<string> => {
    try {
      console.log("🚀 S3 업로드 시작:", file.name, "크기:", file.size);

      // 파일 업로드 시에도 apiEndpoint 재검증
      if (!apiEndpoint || apiEndpoint.trim() === "") {
        throw new Error(
          "Invalid apiEndpoint: Cannot upload file without a valid API endpoint."
        );
      }

      // 1. 계층 구조 파일명 생성
      const fileName = generateHierarchicalFileName(file);

      // 2. presigned URL 요청
      const response = await fetch(
        `${apiEndpoint}?key=${encodeURIComponent(fileName)}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get presigned URL: ${response.statusText}`);
      }

      const responseData = await response.json();
      const { presignedUrl, publicUrl } = responseData;

      // 3. S3에 업로드
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      // 4. 공개 URL 반환
      return publicUrl;
    } catch (error) {
      console.error("S3 upload failed:", error);
      throw error;
    }
  };
};
