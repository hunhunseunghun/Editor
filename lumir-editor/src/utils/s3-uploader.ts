export interface S3UploaderConfig {
  apiEndpoint: string; // '/api/s3/presigned'(필수)
  env: "production" | "development"; // 환경 (필수)
  path: string; // 파일 경로 (필수)
}

export const createS3Uploader = (config: S3UploaderConfig) => {
  const { apiEndpoint, env, path } = config;

  // 필수 파라미터 검증
  if (!apiEndpoint || apiEndpoint.trim() === "") {
    throw new Error(
      "apiEndpoint is required for S3 upload. Please provide a valid API endpoint."
    );
  }

  if (!env) {
    throw new Error("env is required. Must be 'development' or 'production'.");
  }

  if (!path || path.trim() === "") {
    throw new Error("path is required and cannot be empty.");
  }

  // 계층 구조 파일명 생성 함수
  const generateHierarchicalFileName = (file: File): string => {
    const now = new Date();

    // 날짜 (yyyy-mm-dd)

    // 파일명
    const filename = file.name;

    // {env}/{path}/{date}/{time}/{filename}
    return `${env}/${path}/${filename}`;
  };

  return async (file: File): Promise<string> => {
    try {
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
        const errorText = (await response.text()) || "";
        throw new Error(
          `Failed to get presigned URL: ${response.statusText}, ${errorText}`
        );
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
