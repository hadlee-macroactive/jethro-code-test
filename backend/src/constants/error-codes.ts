import { ErrorCode } from '../types/api.types';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
  [ErrorCode.INVALID_REQUEST]: 'Invalid request parameters',
  [ErrorCode.UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.FORBIDDEN]: 'Insufficient permissions',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.RATE_LIMITED]: 'Too many requests',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.STREAK_NOT_FOUND]: 'Streak not found',
  [ErrorCode.STREAK_EXPIRED]: 'Streak has expired',
  [ErrorCode.FREEZE_UNAVAILABLE]: 'No freeze available',
  [ErrorCode.INVALID_STREAK_TYPE]: 'Invalid streak type',
  [ErrorCode.BADGE_NOT_FOUND]: 'Badge not found',
  [ErrorCode.ALREADY_EARNED]: 'Badge already earned',
  [ErrorCode.INVALID_CRITERIA]: 'Invalid badge criteria',
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.INVALID_USER_ID]: 'Invalid user ID',
  [ErrorCode.CREATOR_NOT_FOUND]: 'Creator not found',
  [ErrorCode.INVALID_CONFIG]: 'Invalid configuration',
};
