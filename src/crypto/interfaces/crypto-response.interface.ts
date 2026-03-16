export interface ApiResponse<T> {
  successful: boolean;
  error_code?: string;
  data: T | null;
}
