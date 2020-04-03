exports.requestTemplate = {
  version: '2018-05-29',
  statements: ["select * from message where userId = '$context.source.id';"]
}

exports.responseTemplate = `
## Raise a GraphQL field error in case of a datasource invocation error
#if($ctx.error)
    $utils.error($ctx.error.message, $ctx.error.type)
#end

$utils.toJson($utils.rds.toJsonObject($ctx.result)[0])
`.trim()
