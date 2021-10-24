import { DynamoDB } from '@aws-sdk/client-dynamodb';
import {
  Data,
  DataService,
  DataType,
  Page,
  PageRequest,
} from '@support-site/data';
import { DATA_KEY, DATA_TYPE_KEY, PAGE_KEY, SUPPORT_SITE_TABLE } from './table';

export class DynamoDataService implements DataService {
  constructor(private client = new DynamoDB({ region: 'eu-central-1' })) {}

  async getDataForType(
    type: DataType,
    request: PageRequest,
    group?: string
  ): Promise<Page<Data>> {
    let key = `${DataType[type]}`;
    if (group) {
      key = `${group}-${key}`;
    }

    const response = await this.client.getItem({
      TableName: SUPPORT_SITE_TABLE,
      Key: {
        [DATA_TYPE_KEY]: { S: key },
        [PAGE_KEY]: { N: `${request.page}` },
      },
    });

    let data = response.Item ? JSON.parse(response.Item[DATA_KEY].S) : [];
    if (!Array.isArray(data)) {
      data = [data];
    }

    return {
      content: data,
      page: request.page,
    };
  }
}
