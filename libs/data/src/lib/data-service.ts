import { Data, Page, DataType, PageRequest } from '..';

export interface DataService {
  getDataForType(type: DataType, request: PageRequest, group?: string): Page<Data>;
}
