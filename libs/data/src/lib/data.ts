export enum DataType {
  MESSAGE,
  IMAGE,
  LINK,
}

export interface Data {
  type: DataType;
  data: string;
  title?: string;
  comment?: string;
}
