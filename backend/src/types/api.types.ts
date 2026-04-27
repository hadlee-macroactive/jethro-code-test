export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  STREAK_NOT_FOUND = 'STREAK_NOT_FOUND',
  STREAK_EXPIRED = 'STREAK_EXPIRED',
  FREEZE_UNAVAILABLE = 'FREEZE_UNAVAILABLE',
  INVALID_STREAK_TYPE = 'INVALID_STREAK_TYPE',
  BADGE_NOT_FOUND = 'BADGE_NOT_FOUND',
  ALREADY_EARNED = 'ALREADY_EARNED',
  INVALID_CRITERIA = 'INVALID_CRITERIA',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_USER_ID = 'INVALID_USER_ID',
  CREATOR_NOT_FOUND = 'CREATOR_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
}
