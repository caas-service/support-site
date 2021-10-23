import { DataType } from './data';

export interface DataService {
  getDataForType(type: DataType);
}
