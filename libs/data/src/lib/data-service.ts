import { Data, DataType } from './data';
import { Page, PageRequest } from './page';

export interface DataService {
  getDataForType(
    type: DataType,
    request: PageRequest,
    group?: string
  ): Promise<Page<Data>>;
}
