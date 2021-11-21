export interface Page<T> {
  content: T[];
  page: number;
}

export interface PageRequest {
  page?: number;
}
