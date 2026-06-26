import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class QuestionsGeneratorUiHostingStack  extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for UI hosting
    const UiHostingBucket = new s3.Bucket(this, 'QuestionsGeneratorUiBucket', {
      bucketName: `questions-generator-ui-hosting-${cdk.Aws.ACCOUNT_ID}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow public read via bucket policy
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Delete bucket on stack deletion
      autoDeleteObjects: true, // Automatically delete objects when bucket is deleted
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'QuestionsGeneratorUiDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(UiHostingBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        compress: true,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL for UI',
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'UiHostingBucketName', {
      value: UiHostingBucket.bucketName,
      description: 'S3 bucket for UI hosting',
    });
  }
}