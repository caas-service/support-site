import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import {
  Data,
  DataService,
  DataType,
  Page,
  PageRequest,
} from '@support-site/data';
import { DATA_TYPE_KEY, PAGE_KEY, SUPPORT_SITE_TABLE } from '..';

export class DynamoDataService implements DataService {
  constructor(
    private client = new DynamoDBClient({ region: 'eu-central-1' })
  ) {}

  async getDataForType(
    type: DataType,
    request: PageRequest,
    group?: string
  ): Promise<Page<Data>> {
    let key = `${type}`;
    if (group) {
      key = `${group}-${key}`;
    }

    const getCommand = new GetItemCommand({
      TableName: SUPPORT_SITE_TABLE,
      Key: {
        [DATA_TYPE_KEY]: { S: key },
        [PAGE_KEY]: { N: `${request.page}` },
      },
    });

    const response = await this.client.send(getCommand);
    response.Item

    return null;
  }
}
