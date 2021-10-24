import * as cdk from '@aws-cdk/core';
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { join } from 'path';
import {
  DATA_TYPE_KEY,
  PAGE_KEY,
  SUPPORT_SITE_TABLE,
} from '@support-site/dynamo-data-service';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Table, TableProps, AttributeType } from '@aws-cdk/aws-dynamodb';
import { CfnOutput, Construct } from '@aws-cdk/core';

const dist = (path: string) => join('../../dist/', path);

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new HttpApi(this, 'support-site-api', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET],
      },
    });

    const getDataFunction = new Function(this, 'lambda', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(dist('libs/lambda-rest-api')),
      handler: 'lambda-rest-api.getData',
      logRetention: RetentionDays.SIX_MONTHS,
    });

    const dataServiceTable = new SupportSiteTable(this, 'support-site-table', {
      readCapacity: 10,
      writeCapacity: 5,
    });
    dataServiceTable.grantReadData(getDataFunction);

    api.addRoutes({
      path: '/data/{type}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: getDataFunction }),
    });

    new CfnOutput(this, 'apiUrl', {
      value: api.url,
    });
  }
}

class SupportSiteTable extends Table {
  constructor(scope: Construct, id: string, options?: Partial<TableProps>) {
    super(scope, id, {
      ...options,
      tableName: SUPPORT_SITE_TABLE,
      partitionKey: { name: DATA_TYPE_KEY, type: AttributeType.STRING },
      sortKey: { name: PAGE_KEY, type: AttributeType.NUMBER },
    });
  }
}
