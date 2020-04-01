# Apollo-server

"Starting point for a GraphQL server application with Node.js. Authored by RWieruch. Book --> https://courses.robinwieruch.de/p/the-road-to-graphql"

# Supply GraphQL Schema to AppSync

For supply GraphQL Schema to AppSync I need to merge modularized schema into one file.
I am using npm package -graphql-schema-utilities for that purpose
See bash command below, but before that, I need to make manual preparation for creating schema_utiliies folders and its inner files which corresponds to folder ./src/schema/ and its inner files
\$graphql-schema-utilities -s "./schema_utilities/\*.graphql" -o schema.graphql
After running this command merged schema appeared in schema.graphql file
// TODO - find a method of creating schema_utilities folder with it inner files without manual preparation
For more info see https://aws.amazon.com/blogs/mobile/merging-graphql-schema-files-and-more-with-the-cli/

# Using pulumi for AppSync creation.

For more details take a look at this great article.

https://medium.com/@wesselsbernd/bff-back-end-for-front-end-architecture-as-of-may-2019-5d09b913a8ed

In my implementation of @BerndWessels method I don't create UserPool, Database Cluster (Aurora Serverlwss) and secret for it via Pulumi, so that I commented out related staff in \bff_pulumi\index.js file.
But .\bff_pulumi\secret.js file has to contain:

- database cluster ARN;
- database cluster secret ARN;
- user pool ID.

  `
  userPool = {
  id: 'XXX'
  }

  dbCluster = {
  arn: 'arn:aws:rds:XXX(region):XXXXXXXXXXXX:cluster:XXX'
  }

  dbClusterSecret = {
  arn: 'arn:aws:secretsmanager:XXX(region):XXXXXXXXXXXX:secret:XXX'
  }

  exports.userPool = userPool
  exports.dbCluster = dbCluster
  exports.dbClusterSecret = dbClusterSecret
  `
  After runing command:
  \$pulumi up
  I did 9 steps which was describded by @BerndWessels in his article.
  Now that we have enabled the Data API for your Database Cluster we can create an AppSync DataSource for it.

1. Go to your AWS AppSync console for your GraphQL API
2. Click your newly created GraphQL API to edit it
3. Click on Data Sources and then on Create data source
4. For Data source name enter graphQLDataSource_manual
5. For Data source type select Relational database
6. For Region choose us-east-1
7. Select your newly created Database Cluster from the dropdown
8. Select your newly created Secret from the dropdown
9. Choose Existing role and select your newly created “graphQLDataSourceServiceRole” role from the dropdown

I also did 10th step:

10. Add database name

We have to create the database manually via Query Editor in Appsync page or automatically via Sequelize ORM which we can connect to cluster via Cloud9 service

For more details how we can connect to our cluster via Cloud9 service in link below
https://aws.amazon.com/getting-started/hands-on/configure-connect-serverless-mysql-database-aurora/
