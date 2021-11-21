import { Data, DataType } from '@support-site/data';

export type DataTypeMap = { [t in DataType]: Data[] };

export interface DataParser {
  parse(file: string): DataTypeMap;
}
