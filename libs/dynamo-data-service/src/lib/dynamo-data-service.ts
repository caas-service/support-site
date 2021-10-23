import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  Data,
  DataService,
  DataType,
  Page,
  PageRequest,
} from '@support-site/data';

export class DynamoDataService implements DataService {
  constructor(
    private client = new DynamoDBClient({ region: 'eu-central-1' })
  ) {}

  getDataForType(
    type: DataType,
    request: PageRequest,
    group?: string
  ): Page<Data> {
    return null;
  }
}
