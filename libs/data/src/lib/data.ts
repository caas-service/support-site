export enum DataType {
  MESSAGE,
  IMAGE,
  LINK,
}

export interface Data {
  data: string;
  title?: string;
  comment?: string;
}
