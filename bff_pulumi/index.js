'use strict'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// node dependencies
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const fs = require('fs')
const glob = require('glob')
const path = require('path')

// Add the ability to read .graphql files as strings.
// Read the GraphQL Schema as a string: const graphQLSchema = require('./schema.graphql')
require.extensions['.graphql'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8')
}

// Pulumi dependencies
const pulumi = require('@pulumi/pulumi')
const aws = require('@pulumi/aws')
const awsx = require('@pulumi/awsx')

// Regular Expression helper function
const findMatches = (regex, str, matches = []) => {
  const res = regex.exec(str)
  res && matches.push(res[1]) && findMatches(regex, str, matches)
  return matches
}

const secret = require('./secret.js')

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Aurora Serverless
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
const dbCluster = new aws.rds.Cluster('dbCluster', {
  applyImmediately: true,
  clusterIdentifier: 'mycluster',
  engineMode: 'serverless',
  iamDatabaseAuthenticationEnabled: false,
  port: 3306,
  masterPassword: secret.dbUser.masterPassword,
  masterUsername: secret.dbUser.masterUsername,
  scalingConfiguration: {
    autoPause: true,
    maxCapacity: 1,
    minCapacity: 1,
    secondsUntilAutoPause: 600
  },
  skipFinalSnapshot: true
})

// TODO Automatically enable Data API once it becomes available in pulumi.

exports.dbClusterEndpoint = dbCluster.endpoint

const dbClusterSecret = new aws.secretsmanager.Secret('dbClusterSecret', {})

const dbClusterSecretVersion = new aws.secretsmanager.SecretVersion(
  'dbClusterSecretVersion',
  {
    secretId: dbClusterSecret.id,
    secretString: JSON.stringify({
      username: secret.dbUser.masterPassword,
      password: secret.dbUser.masterPassword
    })
  }
)
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AppSync
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Read the GraphQL Schema as a string.
const graphQLSchema = require('./schema.graphql')

const graphQLApiCloudWatchLogsRole = new aws.iam.Role(
  'graphQLApiCloudWatchLogsRole',
  {
    assumeRolePolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Service: 'appsync.amazonaws.com'
          },
          Action: 'sts:AssumeRole'
        }
      ]
    })
  }
)

const graphQLApiCloudWatchLogsRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  'graphQLApiCloudWatchLogsRolePolicyAttachment',
  {
    policyArn:
      'arn:aws:iam::aws:policy/service-role/AWSAppSyncPushToCloudWatchLogs',
    role: graphQLApiCloudWatchLogsRole.name
  }
)

const graphQLApi = new aws.appsync.GraphQLApi('graphQLApi', {
  authenticationType: 'AMAZON_COGNITO_USER_POOLS',
  logConfig: {
    cloudwatchLogsRoleArn: graphQLApiCloudWatchLogsRole.arn,
    fieldLogLevel: 'ERROR'
  },
  userPoolConfig: {
    awsRegion: 'us-east-1',
    defaultAction: 'DENY',
    userPoolId: secret.userPool.id
  },
  schema: graphQLSchema
})

const graphQLDataSourceServiceRole = new aws.iam.Role(
  'graphQLDataSourceServiceRole',
  {
    assumeRolePolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Service: 'appsync.amazonaws.com'
          },
          Action: 'sts:AssumeRole'
        }
      ]
    })
  }
)

const graphQLDataSourceServiceRolePolicyValue = pulumi
  .all([secret.dbCluster.arn, secret.dbClusterSecret.arn])
  .apply(([dbClusterArn, dbClusterSecretArn]) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['rds-data:*'],
          Resource: [dbClusterArn, `${dbClusterArn}:*`]
        },
        {
          Effect: 'Allow',
          Action: ['secretsmanager:GetSecretValue'],
          Resource: [dbClusterSecretArn, `${dbClusterSecretArn}:*`]
        }
      ]
    })
  )

const graphQLDataSourceServiceRolePolicy = new aws.iam.RolePolicy(
  'graphQLDataSourceServiceRolePolicy',
  {
    policy: graphQLDataSourceServiceRolePolicyValue,
    role: graphQLDataSourceServiceRole.id
  }
)

const graphQLDataSourceName = 'graphQLDataSource_manual'

const graphQLResolvers = []
glob.sync('./graphql/resolvers/**/*.js').forEach(function (file) {
  const resolverMatches = findMatches(/([a-zA-Z]+)\./g, file)
  const resolverObject = require(path.resolve(file))
  const graphQLResolver = new aws.appsync.Resolver(
    `graphQLResolver_${resolverMatches.join('_')}`,
    {
      apiId: graphQLApi.id,
      dataSource: graphQLDataSourceName,
      field: resolverMatches[1],
      requestTemplate: JSON.stringify(resolverObject.requestTemplate),
      responseTemplate: resolverObject.responseTemplate.trim(),
      type: resolverMatches[0]
    }
  )
  graphQLResolvers.push(graphQLResolver)
})

exports.graphQLApiUris = graphQLApi.uris

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
