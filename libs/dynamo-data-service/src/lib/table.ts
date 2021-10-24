import { AttributeType, Table, TableProps } from '@aws-cdk/aws-dynamodb';
import { Construct } from '@aws-cdk/core';

export const SUPPORT_SITE_TABLE = 'SupportSiteData';

export const DATA_TYPE_KEY = 'DataType';
export const PAGE_KEY = 'Page';

export class SupportSiteTable extends Table {
  constructor(scope: Construct, id: string, options?: Partial<TableProps>) {
    super(scope, id, {
      ...options,
      tableName: SUPPORT_SITE_TABLE,
      partitionKey: {name: DATA_TYPE_KEY, type: AttributeType.STRING},
      sortKey: {name: PAGE_KEY, type: AttributeType.NUMBER},
    });
  }
}
