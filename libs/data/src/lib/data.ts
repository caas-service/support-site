export enum DataType {
  MESSAGE,
  IMAGE,
  LINK,
}

export interface Data {
  id: string;
  data: string;
  type: DataType;
}
