"# apollo-server"
"Starting point for a GraphQL server application with Node.js. Authored by RWieruch. Book --> https://courses.robinwieruch.de/p/the-road-to-graphql"

For supply GraphQL Schema to AppSync I need to merge modularized schema into one file.
I am using npm package -graphql-schema-utilities for that purpose
See bash command below, but before that, I need to make manual preparation for creating schema_utiliies folders and its inner files which corresponds to folder ./src/schema/ and its inner files
\$graphql-schema-utilities -s "./schema_utilities/\*.graphql" -o schema.graphql
After running this command merged schema appeared in schema.graphql file
// TODO - find a method of creating schema_utilities folder with it inner files without manual preparation
For more info see https://aws.amazon.com/blogs/mobile/merging-graphql-schema-files-and-more-with-the-cli/
