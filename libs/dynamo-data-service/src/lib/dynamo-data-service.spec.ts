import { DynamoDataService } from '@support-site/dynamo-data-service';

describe('dynamoDataService', () => {
  it('should work', () => {
    expect(new DynamoDataService()).toBeTruthy();
  });
});
