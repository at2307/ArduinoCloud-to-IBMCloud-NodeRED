**-- from Arduino Cloud to IBM Cloud () - containerized Node-RED on IBM Cloud --**
## (2) adding COS (Cloud Object Storage) with Functions and Data Engine

As stated before, the collected data in this project is a "Time-series data". To avoid "large amounts" of data in our Cloudant database, we are going to add the IBM Cloud Object Storage (COS). Of course, our project is small at the moment, but as we are exploring, we would like to know how can we get our data from Cloudant to COS.

Additionally, COS can be queried, using SQL in the IBM Cloud **Data Engine**, which is of **interest** to us!

To get our data to COS, after reading an excellent article by James Thomas [Using Cloud Object Storage from IBM Cloud Functions (Node.js)](https://jamesthom.as/2018/05/using-cloud-object-storage-from-ibm-cloud-functions-node.js/), I've been encouraged to try to use Functions ([FaaS](https://www.ibm.com/topics/faas)) with an action that we could call from Node-RED flow, passing a data object to it. This seems to fit well with what we are trying to achieve.

So, in this part(2) we are going to add the following resources:

- the [IBM Cloud Object Storage](https://www.ibm.com/cloud/object-storage);
- the [IBM Cloud Functions](https://www.ibm.com/cloud/functions) that will handle putting an object into COS;
- the [IBM Cloud Data Engine](https://www.ibm.com/cloud/data-engine) that can query COS.

### --1st-- Cloud Object Storage

**Provisioning an instance**

> IBM Cloud > Create resource > Object Storage

DOCS:
- [Getting started with IBM Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage)

To use the service, we need to create authentication credentials.

**Service Credentials**

> IBM Cloud Resource list > Cloud Object Storage instance > Service credentials : New credential

We can name it ` TestCOS ` .

Next, for our data in COS we will need a "bucket".

**A bucket**

We can add it using the web console UI.

> IBM Cloud Resource list > Cloud Object Storage instance > Buckets : Create bucket

Let's name it ` test.cos-bucket-01 ` .

The bucket in our COS instance:

![Screenshot of COS](/2ibm_cos/assets_png/COS-scrnsht_01.png)

### --2nd-- Functions

As with many products in IBM Cloud, we can work from IBM Cloud console UI, or from CLI. For [IBM Cloud Functions](https://cloud.ibm.com/functions/) we are going to use CLI. So, [install the CLI plug-in](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-cli_install).

DOCS:
- [Functions Concepts](https://cloud.ibm.com/functions/learn/concepts) - Namespaces, Actions, …
- [Getting started with IBM Cloud Functions](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-getting-started)

We are going to write an action which we will call from Node-RED flow. This action will handle putting an object into COS. However, before writing an action code there are a couple of things to do.

Our **action** will need configuration parameters (authentication, the service endpoint, and a bucket name), to work with COS.

We can "*bind parameters to actions to set default parameters. Bound parameters serve as the default parameters for actions unless parameters are supplied at invocation*". See [Binding parameters to actions](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-actions#actions_params).

We can also use packages "*to bundle together a set of related actions*". Though we are starting with just one action, we can put it already in a sensible package, if not, it will belong to a "Default Package". Packages "*allow parameters to be shared across all entities in the package*". See [Packaging actions](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-actions#actions_pkgs).

So, that's what we will do.

We need to create a **package**, e.g. ` cos-actions ` :
```bash
ibmcloud fn package create cos-actions
```

Our **parameters** to be used:
- "bucket" : <CREATED_BUCKET_NAME> ` test.cos-bucket-01 `
-  "cos_endpoint" : <OUR_COS_ENDPOINT> ` s3.private.eu-de.cloud-object-storage.appdomain.cloud `

To update a package to [**bind the default parameters**](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-actions#actions_pkgs_params) to it:
```bash
ibmcloud fn package update cos-actions -p bucket test.cos-bucket-01 -p cos_endpoint s3.private.eu-de.cloud-object-storage.appdomain.cloud
```

To **bind the service** to an action or **package** see: [Binding IBM Cloud services to Cloud Functions entities](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-services), and run:
```bash
ibmcloud fn service bind cloud-object-storage cos-actions
```

The output should confirm it:
```bash
Credentials 'TestCOS' from 'cloud-object-storage' service instance 'Cloud Object Storage' bound to 'cos-actions'.
```

To verify that the parameters were bound to the package, run:
```bash
ibmcloud fn package get cos-actions parameters
```

The output:
```json
[
    {
        "key": "bucket",
        "value": "test.cos-bucket-01"
    },
    {
        "key": "cos_endpoint",
        "value": "s3.private.eu-de.cloud-object-storage.appdomain.cloud"
    },
    {
        "key": "__bx_creds",
        "value": {
            "cloud-object-storage": {
                [ ]
            }
        }
    }
]
```

**Action in Node.js**

Our action will handle putting an object into COS, so let's create a file ` action.js ` which we will use to create this action from the command line.

Generally, for our action we can copy parts of the code samples from the aforementioned James' article:
1. the ` const COS = require('ibm-cos-sdk') ` line to use JavaScript client library for IBM Cloud Object Storage;
2. the ` function cos_client (params) {} ` that handles authentication between fn and cos;
3. the ` function upload (params) {} ` that we will call to upload an object;
4. and the ` exports.upload = upload; ` line.

However, for our project -
- we do not need to worry about Base64 encoding,
- nor the MIME type,
- but we do need to modify one thing - the body param of the upload function, as it needs to handle a JSON object.

Since in this sample function we are using [Buffer objects in Node.js](https://nodejs.org/api/buffer.html#buffer), from what I found searching for [Node Convert a JSON Object to Buffer](https://stackoverflow.com/search?q=Node+Convert+a+JSON+Object+to+Buffer), we need to stringify the json object with ` JSON.stringify ` , so our body param should look like this: ` Buffer.from(JSON.stringify(params.body)) ` in order to work.

Our upload function:

```javascript
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
```

> (the whole code is available in the repository)

Having this, we can now create an action in our package, naming it ` upload-object ` :

```bash
ibmcloud fn action create cos-actions/upload-object action.js --main upload
```

The created action we can also see in the web console (where we can check/modify our code, adjust Runtime properties, check Endpoints, etc.):

![Screenshot of an Action in a Package](/2ibm_cos/assets_png/COS-scrnsht_02-fn-action.png)

Now we shall be able to call it, and it should handle putting an object into COS. The "bucket" is already defined in the "**Parameters**", so the "name" and the "body" we will need to provide in the call.

### --3rd-- Node-RED flow

Our Node-RED application can be opened e.g. from the list of Applications of our Code Engine instance:

> Code Engine instane > Applications > (Application link)

In Node-RED, knowing that our 1st flow is working well, we will create a separate flow for our app, in which we will simply query Cloudant, and request a bundle of data (that is "4 previous hours of data"), to be put into a COS object.

For a start, let us do what we basically have in our debug line of the 1st flow, with a slight modification in a query 'function node' and adding let's say a 'change node' (to put the received payload in the flow context (like a *temp variable*, that can be shared between nodes of the flow)).

Our 'function node' query:

```javascript
// 4 h = (3600 x 4 = 14400 s) = 14400000 ms
msg.payload = {
    "selector": {
        "timestamp": {
            "$gt": (Date.now() - 14400000)
        }
    },
    "sort": [
        {
            "timestamp": "desc"
        }
    ],
    "limit": 200
};
return msg;
```

In the 'change node' rules, we just need to assign the received ` msg.payload.docs ` (from our cloudant node) to e.g. ` flow.bundle ` where the 'bundle' is just a key under which the value will be stored.

This gives us a bundle of data in our flow, so we can use it in other nodes.

![Screenshot of Node-RED part flow](/2ibm_cos/assets_png/nodered-2COS-scrnsht_01.png)

Now, we need to build a sequence of nodes to call our action from IBM Cloud Functions.

We can start with a 'complete' node (that is, when the 'bundle' node completes), which we can use to invoke the sequence.

To be able to request an action, we need to deal with the IAM authentication, and we are going to use standard nodes. We want to keep our action requiring authentication. I am mentioning it, as our action could be a web action (that can be invoked without authentication), but that's not what we want.

We will need the Service apikey of our Functions:

> IAM > Service IDs > 'Name of the Namespace' > Manage service ID > API Keys : Create

This apikey, we put in "Secrets" for the Code Engine (which runs our Node-RED) - as we did in the 1st part, with creating an env var to use this secret, e.g. ` COS_APIKEY ` ; and the endpoint for our action we put in "Configmaps", creating an env var ` COS_URL ` for it as well.

![Screenshot of CodeEngine env var](/2ibm_cos/assets_png/nodered-on-CodeEngine-scrnsht_07.png)

To **prepare the body** with the **required headers** for our request, we will create a 'function node', containing:

```javascript
let key = env.get("COS_APIKEY");
msg.payload = "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=" + key;
msg.headers = {};
msg.headers['Accept'] = 'application/json';
msg.headers['content-type'] = 'application/x-www-form-urlencoded';
return msg;
```

In the following 'http request' node we just need to specify the method (POST) and URL, which for IBM tokens is ` https://iam.cloud.ibm.com/oidc/token ` .

Having the token, we need to **prepare the body** and **headers** for our request of the action. We also need two parameters for our action: "body" and "name", which need to be put in the message payload. To the "body" we assign our "bundle" ` msg.payload.body = flow.get("bundle"); ` , and to the "name" we assign a name we want to give to our objects stored in COS - I will simply use a timestamp ` let num = Date.now(); msg.payload.name = num.toString() + '.json'; ` (which will be a time of requesting the action).

```javascript
let receivedToken = msg.payload.access_token;
msg.headers = {};
msg.headers['Accept'] = 'application/json';
msg.headers['authorization'] = 'Bearer' + receivedToken;
msg.payload = {};
msg.payload.body = flow.get("bundle");
let num = Date.now();
msg.payload.name = num.toString() + '.json';
return msg;
```

In the following 'http request' node we just need to specify the method (POST) and URL - our Action endpoint, which we take from the env var ` ${COS_URL} ` .

That's basically all that's needed. We can add a couple of extra nodes (debug) to see what's happening and another change node to reset our bundle var.

The whole flow:

![Screenshot of Node-RED flow](/2ibm_cos/assets_png/nodered-2COS-scrnsht_02.png)

From the created flow, we are getting document objects (from Cloudant) containing the timestamp within the last 4h. As our data volume is small, this should give us about 100 JSON objects, and this is what we are putting in COS as one object. The trigger calls our (function) **action** repeatedly every 4h, so this produces 6 such *bundled objects* in every 24h.

Our object in COS:

![Screenshot of json object](/2ibm_cos/assets_png/nodered-2COS-scrnsht_03-json-bundle.png)

After downloading it, we can see the proper contents of it:

![Screenshot of json object](/2ibm_cos/assets_png/nodered-2COS-scrnsht_04-json-bundle.png)

For a quick check if an action was called, apart from the Node-RED, and contents of the COS bucket, we can also use [Activations Dashboard](https://cloud.ibm.com/functions/dashboard) in Functions.

### --4th-- Data Engine

With [IBM Cloud Data Engine](https://www.ibm.com/cloud/data-engine) we can query the COS objects.

**Provisioning an instance**

> IBM Cloud > Create resource > Data Engine

DOCS:
- [Getting started with IBM Cloud Data Engine](https://cloud.ibm.com/docs/sql-query?topic=sql-query-getting-started)

To open Data Engine navigate to COS object in a bucket > Object details > Open in Data Engine, or:

> IBM Cloud Resource list > Data Engine instance > Launch Data Engine UI

To get us started, we can for instance ask to find in our data (inside of our json files stored), let's say 20 records with highest acc values of yesterday's data.

I will query it by narrowing down the files to those with names starting with 1692* (which for us spans several days in Aug 2023), and matching the timestamp in our data to timestamps corresponding to yesterday. Our timestamp is a number of ms, and when working with timestamps, as with any matching, we need to make sure that we speak in the same formats and units. So, for our query, our timestamp number needs a slight transformation  ` TO_TIMESTAMP(FROM_UNIXTIME(timestamp/1000)) ` .

The below screenshot shows the query and the result of it, that is 20 records with biggest acc values, of yesterday, in a descending order of time (queried on Aug 17th).

![Screenshot of Data Engine](/2ibm_cos/assets_png/IBMCloud-DataEngine-COS-Screenshot.png)

The query:

```sql
WITH COS AS (
  SELECT _id, dev, timestamp, acc FROM cos://<location>/<bucket>/<prefix> STORED AS JSON
  WHERE TO_TIMESTAMP(FROM_UNIXTIME(timestamp/1000)) BETWEEN
    TO_TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY) AND TO_TIMESTAMP(CURRENT_DATE) AND acc > 0.95
  ORDER BY acc DESC
  LIMIT 20)
SELECT * FROM COS
ORDER BY timestamp DESC
```

As we can see, we can even query many objects in COS at a time, using SQL, to find what we are looking for in the stored data. We cannot expect instant answers to such ad hoc queries on COS, but it doesn't take that long either. What's more, query jobs can be submitted to Data Engine by API, which further opens the door …

### --SUMMARY--

This accomplishes part(2) of our project, that is, it gets our data from Cloudant and puts it in COS, with a help of an action from IBM Cloud Functions, calling it in our Node-RED flow.

In the created flow, our action we call once every 4 hours, to copy all previous 4h records (json documents) from Cloudant to COS object. This allows us to use Data Engine to query COS.

Now, both flows happen automatically, and we have the Cloudant db and COS slowly growing. This time, we've done a little bit more coding, but not too much, obtaining very satisfying results!

The above description documents -
- getting Cloud Object Storage and Data Engine in our Resources;
- starting with Cloud Functions;
- binding a service (COS) to Cloud Functions entity;
- writing a Node.js action that uploads an object to COS;
- creating an additional flow in Node-RED (handling the IAM authentication with Node-RED functions, and passing the data);
- writing a sample query in Data Engine that fetches data of interest from different objects stored in COS.

---------------------------------------------------------------------------
For reference:

For why to copy and not delete from Cloudant, and what to do instead, go back to the "[Time-series Data Storage](https://blog.cloudant.com/2019/04/08/Time-series-data-storage.html)" article.

DOCS:
- [IBM Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage)
- [IBM Cloud Functions](https://cloud.ibm.com/docs/openwhisk)
- [IBM Cloud Data Engine](https://cloud.ibm.com/docs/sql-query)
- [Using Cloud Object Storage from IBM Cloud Functions (Node.js)](https://jamesthom.as/2018/05/using-cloud-object-storage-from-ibm-cloud-functions-node.js/) by James Thomas

Other of interest:
- [Automated Daily Backups](https://blog.cloudant.com/2020/10/09/Automated-Daily-Backups.html) article also shows a different way of getting data from Cloudant to COS.
