import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  Data,
  DataService,
  DataType,
  Page,
  PageRequest,
} from '@support-site/data';
import { DATA_KEY, DATA_TYPE_KEY, PAGE_KEY, SUPPORT_SITE_TABLE } from './table';
import { chunk } from 'lodash';

export class DynamoDataService implements DataService {
  constructor(
    private group?: string,
    private maxPageSize = 10,
    private table = SUPPORT_SITE_TABLE,
    private client = new DynamoDBClient({ region: 'eu-central-1' })
  ) {}

  private buildKey(type: DataType) {
    let key = `${DataType[type]}`;
    if (this.group) {
      key = `${this.group}-${key}`;
    }
    return key;
  }

  async getDataForType(
    type: DataType,
    request: PageRequest
  ): Promise<Page<Data>> {
    const key = this.buildKey(type);

    const response = await this.client.send(
      new GetItemCommand({
        TableName: this.table,
        Key: {
          [DATA_TYPE_KEY]: { S: key },
          [PAGE_KEY]: { N: `${request.page}` },
        },
      })
    );

    return {
      content: this.parseItem(response.Item),
      page: request.page,
    };
  }

  private parseItem(item?: { [key: string]: AttributeValue }): Data[] {
    if (!item) return [];
    return JSON.parse(item[DATA_KEY].S);
  }

  async saveData(type: DataType, data: Data[]) {
    const response = await this.client.send(
      new QueryCommand({
        TableName: this.table,
        KeyConditionExpression: `${DATA_TYPE_KEY} = :key`,
        ExpressionAttributeValues: {
          ':key': { S: this.buildKey(type) },
        },
        Limit: 1,
        ScanIndexForward: false,
      })
    );

    let lastPage =
      response.Items.length > 0 ? parseInt(response.Items[0][PAGE_KEY].N) : 0;
    const lastPageItem = this.parseItem(response.Items[0]);

    if (lastPageItem.length > 0) {
      const missingCount = this.maxPageSize - lastPageItem.length;
      const appendLastPage = data.splice(0, missingCount);
      lastPageItem.push(...appendLastPage);

      await this.client.send(
        new UpdateItemCommand({
          TableName: this.table,
          Key: {
            [DATA_TYPE_KEY]: { S: this.buildKey(type) },
            [PAGE_KEY]: { N: `${lastPage}`},
          },
          UpdateExpression: `SET #data = :data`,
          ExpressionAttributeNames: {
            '#data': DATA_KEY
          },
          ExpressionAttributeValues: {
            ':data': { S: JSON.stringify(lastPageItem) }
          }
        })
      );
    }

    const chunked = chunk(data, this.maxPageSize);

    for (const d of chunked) {
      await this.client.send(
        new PutItemCommand({
          TableName: this.table,
          Item: {
            [DATA_TYPE_KEY]: { S: this.buildKey(type) },
            [PAGE_KEY]: { N: `${lastPage + 1}` },
            [DATA_KEY]: { S: JSON.stringify(d) },
          },
        })
      );
      lastPage += 1;
    }
  }

  async clearData(type: DataType) {
    await this.client.send(new DeleteItemCommand({
      TableName: this.table,
      Key: {
        [DATA_TYPE_KEY]: { S: this.buildKey(type) },
      },
    }));
  }
}
