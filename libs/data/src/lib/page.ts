export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  hasNext: boolean;
}

export interface PageRequest {
  page: number;
  size: number;
}
