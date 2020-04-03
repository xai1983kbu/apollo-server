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

---

# Using pulumi to supply resolvers to AppSync

We can add resolvers to AWS AppSync using AWS Console but we need to track changes for our resolvers(in Github for example), for that reason we will use @wesselsbernd method described in his super article on medium https://medium.com/@wesselsbernd/bff-back-end-for-front-end-architecture-as-of-may-2019-5d09b913a8ed

In folder /bff_pulumi we will create /graphql/resolvers/ folder where our resolvers will reside.
The pattern of the naming resolver file is next --> `Type.property.js`
First part of name is Type. It can be any type listed in schema.graphql such as Query, User, and so on.
The second part of the name is Property. It can be any property inside any type listed in schema.graphql such as me, message, messages (for type Query), messages (for type User) so on.

Description of two next resolvers:
####Query.message.js
####Query.messages.js
you can find in my answer on StackOverflow https://stackoverflow.com/a/60987863/9783262

####Query.me.js
resolver in its request template(below) uses \$context.indentity in order to find username info from request

```json
{
  "version": "2018-05-29",
  "statements": [
    "select * from user where pool_username='$context.identity.username';"
  ]
}
```

In this template \$context.identity - an object that contains information about the caller.

####User.messages.js
resolver in its request template(below)

```json
{
  "version": "2018-05-29",
  "statements": ["select * from message where userId = '$context.source.id';"]
}
```

In this template \$context.source - a map that contains the resolution of the parent field.
In schema.graphql we have

```json
type User {
	id: ID!
	username: String!
	messages: [Message!]
	pool_username: String
}
type Query {
	users: [User!]
	me: User
	user(id: ID!): User
}
```

Resolvers for Query properties user, me and user doesn't return the result for property `messages: [Message!]`
they only return `id, username, pool_username` (take a look at its request templates' SQL query).
The result for `messages: [Message!]` will be returned from resolver for type `User` property `messages` (take a look at request templates' SQL query in User.messages.js).
\$context.source contains { id, username, pool_usermape } - object with parent fields.

About context in links below:
https://docs.aws.amazon.com/appsync/latest/devguide/resolver-context-reference.html
https://docs.aws.amazon.com/appsync/latest/devguide/resolver-context-reference.html#aws-appsync-resolver-context-reference-identity
