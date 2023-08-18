const COS = require('ibm-cos-sdk')

function cos_client (params) {
  const bx_creds = params['__bx_creds']
  if (!bx_creds) throw new Error('Missing __bx_creds parameter.')

  const cos_creds = bx_creds['cloud-object-storage']
  if (!cos_creds) throw new Error('Missing cloud-object-storage parameter.')

  const endpoint = params['cos_endpoint']
  if (!endpoint) throw new Error('Missing cos_endpoint parameter.')

  const config = {
    endpoint: endpoint,
    apiKeyId: cos_creds.apikey,
    serviceInstanceId: cos_creds.resource_instance_id
  }

  return new COS.S3(config);
}

function upload (params) {
  if (!params.bucket) throw new Error("Missing bucket parameter.")
  if (!params.name) throw new Error("Missing name parameter.")
  if (!params.body) throw new Error("Missing body parameter for an object.")

  const client = cos_client(params)
  const body = Buffer.from(JSON.stringify(params.body))

  const object = {
    Bucket: params.bucket,
    Key: params.name,
    Body: body
  }

  return client.upload(object).promise()
}

exports.upload = upload;
