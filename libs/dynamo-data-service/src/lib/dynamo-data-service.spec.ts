import { DynamoDataService } from './dynamo-data-service';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DATA_KEY, DATA_TYPE_KEY, PAGE_KEY } from './table';
import { Data, DataType } from '@support-site/data';

const anyDataItem = (data = '', title = '') => ({
  [DATA_KEY]: { S: `[{"data": "${data}", "title": "${title}"}]` },
});

const anyDataItemWithKey = (key: string, page: number) => ({
  [DATA_TYPE_KEY]: { S: key },
  [PAGE_KEY]: { N: `${page}`},
});

describe('dynamoDataService', () => {
  const group = 'TEST';
  const service = new DynamoDataService(group, 2);

  it('should work', () => {
    expect(service).toBeTruthy();
  });

  describe('Get data for type', () => {
    it('get data', async () => {
      mockClient(DynamoDBClient)
        .on(GetItemCommand, {
          Key: {
            [DATA_TYPE_KEY]: { S: 'TEST-IMAGE' },
            [PAGE_KEY]: { N: '1' },
          },
        })
        .resolves({
          Item: anyDataItem('<some-link>', 'a image'),
        });

      const page = await service.getDataForType(DataType.IMAGE, { page: 1 });
      expect(page).toEqual(
        expect.objectContaining({
          content: [{ data: '<some-link>', title: 'a image' }],
          page: 1,
        })
      );
    });
  });

  describe('Save Data', () => {
    it('should save data in pages', async () => {
      const mock = mockClient(DynamoDBClient);
      const putItemMock = jest.fn();
      mock.on(PutItemCommand).callsFake(putItemMock);
      mock.on(QueryCommand).resolves({ Items: [] });

      await service.saveData(DataType.IMAGE, [
        { data: 'link1' },
        { data: 'link2' },
        { data: 'link3' },
        { data: 'link4' },
      ]);

      expect(putItemMock).toHaveBeenCalledWith(
        expect.objectContaining({
          Item: {
            [DATA_TYPE_KEY]: { S: 'TEST-IMAGE' },
            [PAGE_KEY]: { N: '0' },
            [DATA_KEY]: { S: expect.stringMatching(/link1.*link2/) },
          },
        })
      );
      expect(putItemMock).toHaveBeenCalledWith(
        expect.objectContaining({
          Item: {
            [DATA_TYPE_KEY]: { S: 'TEST-IMAGE' },
            [PAGE_KEY]: { N: '1' },
            [DATA_KEY]: { S: expect.stringMatching(/link3.*link4/) },
          },
        })
      );
    });

    it('should fill last page before creating new page', async () => {
      const mock = mockClient(DynamoDBClient);

      const putItemMock = jest.fn();
      mock.on(PutItemCommand).callsFake(putItemMock);

      const updateItemMock = jest.fn();
      mock.on(UpdateItemCommand).callsFake(updateItemMock);

      const data: Data[] = [{ data: 'link1' }];
      mock.on(QueryCommand).resolves({
        Items: [
          {
            [DATA_KEY]: { S: JSON.stringify(data) },
            [PAGE_KEY]: { N: '5' },
          },
        ],
      });

      await service.saveData(DataType.IMAGE, [
        { data: 'link2' },
        { data: 'link3' },
        { data: 'link4' },
      ]);

      expect(updateItemMock).toHaveBeenCalledTimes(1);
      expect(updateItemMock).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: {
            [DATA_TYPE_KEY]: { S: 'TEST-IMAGE' },
            [PAGE_KEY]: { N: '5' },
          },
          UpdateExpression: expect.stringContaining(`:data`),
          ExpressionAttributeValues: expect.objectContaining({
            ':data': { S: expect.stringMatching(/link1.*link2/) },
          }),
        })
      );

      expect(putItemMock).toHaveBeenCalledTimes(1);
      expect(putItemMock).toHaveBeenCalledWith(
        expect.objectContaining({
          Item: {
            [DATA_TYPE_KEY]: { S: 'TEST-IMAGE' },
            [PAGE_KEY]: { N: '6' },
            [DATA_KEY]: { S: expect.stringMatching(/link3.*link4/) },
          },
        })
      );
    });
  });

  describe('Clear Data', () => {
    it('should clear all data for type', async () => {
      const mock = mockClient(DynamoDBClient);

      const deleteItemMock = jest.fn();
      mock.on(DeleteItemCommand).callsFake(deleteItemMock);

      mock.on(QueryCommand).resolves({Items: [anyDataItemWithKey('TEST-IMAGE', 0)]})

      await service.clearData(DataType.IMAGE);

      expect(deleteItemMock).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: {
            [DATA_TYPE_KEY]: { S: 'TEST-IMAGE' },
            [PAGE_KEY]: { N: '0' },
          },
        })
      );
    });
  });
});
