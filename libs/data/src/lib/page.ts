export interface Page<T> {
  content: T[];
  page: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

export interface PageRequest {
  page?: number;
  size?: number;
}
