exports.requestTemplate = {
  version: '2018-05-29',
  statements: [
    'SELECT * FROM message INNER JOIN user ON message.userId = user.id;'
  ]
}

exports.responseTemplate = `
#if($ctx.error)
    $util.error($ctx.error.message, $ctx.error.type)
#end

#set($output = $utils.rds.toJsonObject($ctx.result)[0])

## Make sure to handle instances where fields are null
## or don't exist according to your business logic
#foreach( $item in $output )
    #set($item.user = {
        "id": $item.get('userId'),   
        "username": $item.get('username')
    })
#end
$util.toJson($output[0])
`.trim()
