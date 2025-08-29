// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 엔드포인트 타입
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
  requiresAuth?: boolean;
  params?: string[];
  query?: string[];
  body?: any;
  response?: any;
}

// API 요청 옵션 타입
export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// API 응답 헤더 타입
export interface ApiResponseHeaders {
  'content-type'?: string;
  'content-length'?: string;
  'cache-control'?: string;
  'x-ratelimit-limit'?: string;
  'x-ratelimit-remaining'?: string;
  'x-ratelimit-reset'?: string;
}

// API 요청 함수 타입
export type ApiRequestFunction<T = any> = (
  options?: ApiRequestOptions,
) => Promise<ApiResponse<T>>;

// API 클라이언트 타입
export interface ApiClient {
  get: <T = any>(
    path: string,
    options?: Omit<ApiRequestOptions, 'method'>,
  ) => Promise<ApiResponse<T>>;
  post: <T = any>(
    path: string,
    data?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>,
  ) => Promise<ApiResponse<T>>;
  put: <T = any>(
    path: string,
    data?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>,
  ) => Promise<ApiResponse<T>>;
  delete: <T = any>(
    path: string,
    options?: Omit<ApiRequestOptions, 'method'>,
  ) => Promise<ApiResponse<T>>;
  patch: <T = any>(
    path: string,
    data?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>,
  ) => Promise<ApiResponse<T>>;
}

// API 미들웨어 타입
export interface ApiMiddleware {
  name: string;
  handler: (
    request: Request,
    next: () => Promise<Response>,
  ) => Promise<Response>;
}

// API 라우트 핸들러 타입
export type ApiRouteHandler = (request: Request) => Promise<Response>;

// API 라우트 타입
export interface ApiRoute {
  method: HttpMethod;
  handler: ApiRouteHandler;
  middleware?: ApiMiddleware[];
}

// API 라우트 그룹 타입
export interface ApiRouteGroup {
  prefix: string;
  routes: Record<string, ApiRoute>;
  middleware?: ApiMiddleware[];
}

// API 문서화 타입
export interface ApiDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  endpoints: Record<string, ApiEndpoint>;
  schemas: Record<string, any>;
}

// API 에러 코드 타입
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

// API 에러 응답 타입
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    path: string;
  };
}

// API 성공 응답 타입
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// API 응답 유니온 타입
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// API 요청 로그 타입
export interface ApiRequestLog {
  id: string;
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
  duration: number;
  statusCode: number;
  responseSize: number;
  userAgent?: string;
  ipAddress?: string;
}

// API 메트릭 타입
export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  topEndpoints: Array<{
    path: string;
    count: number;
    averageResponseTime: number;
  }>;
}
