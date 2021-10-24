import * as cdk from '@aws-cdk/core';
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway';
import {Code, Function, Runtime} from '@aws-cdk/aws-lambda';
import { join } from 'path';
import {SupportSiteTable} from '@support-site/dynamo-data-service';
import { RetentionDays } from '@aws-cdk/aws-logs';

const dist = (path: string) => join('../../dist/', path);

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'support-site-api');

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

    const dataResource = api.root.addResource('data');
    const dataTypeResource = dataResource.addResource('{type}');

    dataTypeResource.addMethod('GET', new LambdaIntegration(getDataFunction));
  }
}
