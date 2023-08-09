**-- from Arduino Cloud to IBM Cloud () - containerized Node-RED on IBM Cloud --**
## (1) from Arduino to … Cloudant (JSON document DBaaS)

To start with our project we need _something_ (to fetch, to store, and to make things talk to each other).

We do not want to be "writing" a server application, but we need _something_ that can act as a backend (or middleware if you prefer) app for us, so why not [Node-RED](https://nodered.org/)? A flow-based programming tool, to connect nodes that form a flow to accomplish what we want to do.

If you read the docs you will find that one of the ways to run an app (like Node-RED) on IBM Cloud is through the [IBM Cloud Code Engine](https://www.ibm.com/cloud/code-engine/) instance ("*deployment target*"). So, for the purpose of this project, we will use the following resources:

- [Arduino IoT Cloud](https://cloud.arduino.cc/how-it-works/) -- an online platform with data from our boards
- [IBM Cloud : Code Engine](https://www.ibm.com/cloud/code-engine/) -- a serverless PaaS running a containerized app
- Node-RED Docker image -- from a Docker Hub repository
- An [@arduino/node-red-contrib-arduino-iot-cloud](https://github.com/arduino/node-red-contrib-arduino-iot-cloud) contribution node -- to get the data from Arduino Cloud
- [IBM Cloud : Cloudant](https://www.ibm.com/products/cloudant/) -- JSON document DBaaS for IoT and serverless applications - a straightforward solution to quickly get our data into IBM Cloud
- A [node-red-contrib-cloudantplus](https://github.com/hammoaj/node-red-contrib-cloudantplus) contribution node -- to insert data into Cloudant

### --1st-- Arduino Cloud

From the [Arduino DOCS for Cloud REST API](https://docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api) we know that we need to authenticate with a `clientId` and `clientSecret`. Once logged in to Arduino Cloud, simply navigating to "[API keys](https://cloud.arduino.cc/home/api-keys/)" we can "CREATE API KEY" (important to note the values). For now, that's all we need.

### --2nd-- IBM Cloud : Code Engine with Node-RED Docker image

In order to connect to Arduino Cloud and use our API key, we need to create an environment for our Node-RED app. So, we start with provisioning a Code Engine instance and specifying the Node-RED container image.

> IBM Cloud > Create resource > Code Engine > [Start creating]

> [Create project], (Application), (Name), Choose the code to run: Container image > Image reference: ` docker.io/nodered/node-red `

> Listening port: ` 1880 ` (default for Node-RED)

> specify the Resources and Domain mappings

Also, worth considering are the Optional settings

> the > Environment variables, and the > Image start options, as we will see later on.

The below screenshot shows the running instance of Code Engine with the Node-RED app (in my case revision 3, as I played with the parameters).

![Screenshot of Node-RED on Code Engine](/2ibm_cloudant/nodered-on-CodeEngine-scrnsht_01.png)

The Application link can be found in two places:

1. in the list of Applications for our Code Engine instance

> Code Engine instane > Applications > (Application link)

2. in the Domain mappings of the Application

> Code Engine instane > Applications > 'our nodered app' > (Domain mappings)

The first time we visit our Node-RED app, we should see a "Welcome" box… and a blank Workspace with a "WARNING" Comment.

![Screenshot of Node-RED warning](/2ibm_cloudant/nodered-on-CodeEngine-warning-scrnsht_01.png)

Consider the warning.

### --3rd-- Node-RED with Arduino-iot-cloud node

Having the Node-RED running and accessible from the Application link, we can start creating our flow.
For our project we can simply use the available [@arduino/node-red-contrib-arduino-iot-cloud](https://github.com/arduino/node-red-contrib-arduino-iot-cloud) contribution node - for us, this is perfectly fine for now.

Installing the node, can be simply done through:

> Node-RED header > main menu > Manage palette > Install

Search for 'arduino' and [install] the @arduino/node-red-contrib-arduino-iot-cloud

Configuring the node is [straightforward](https://flows.nodered.org/node/@arduino/node-red-contrib-arduino-iot-cloud) and this is where we use our `clientId` and `clientSecret` from Arduino Cloud.

### --4th-- IBM Cloud : Cloudant

DOCS:
- [IBM Cloud : Cloudant](https://www.ibm.com/products/cloudant/) DOCS -- https://cloud.ibm.com/docs/Cloudant/

**Database considerations**

Cloudant - a JSON document DBaaS "*optimized for web, mobile, IoT*"… Since it is a JSON document store, we do not need to worry about defining a schema for our database ahead of time. "Any structure" will be accepted. However, the [data model](https://cloud.ibm.com/docs/Cloudant?topic=Cloudant-data-modeling) matters, so does consideration for storing [date and time](https://blog.cloudant.com/2018/05/22/Date-formats.html).

Our object is simple:
```JSON
{
	"dev": 12345678,
	"timestamp": 0,
	"lat": 0.00000,
	"lon": 0.00000,
	"acc": 0.00000
}
```
where: ` "dev" ` = int (device id), ` "timestamp" ` = Unix timestamp; ` "lat" ` & ` "lon" ` = our gps values as in WGS84, in decimal degrees.

What we want to do here, fits well with Cloudant:
- we are working with JSON objects;
- everything we need (data wise) is in the object;
- our data model consists of objects that are separate documents (referencing the device ID);
- each document is of small size;
- following "write only" design pattern (where documents are only added to a database and not updated);

**Provisioning an instance & Service Credentials**

> IBM Cloud > Create resource > Cloudant

Simple, as in [cloud.ibm.com/docs/Cloudant?topic=Cloudant-getting-started-with-cloudant](https://cloud.ibm.com/docs/Cloudant?topic=Cloudant-getting-started-with-cloudant).

To use the service we will need service credentials, and we will use IBM's IAM API Keys and Tokens.
"*You can generate an IAM token by using either your IBM Cloud API key or a **service ID's API key**.*" [Generating an IBM Cloud IAM token by using an API key](https://cloud.ibm.com/docs/account?topic=account-iamtoken_from_apikey). Check also: [Invoking IBM Cloud service APIs](https://cloud.ibm.com/docs/account?topic=account-iamapikeysforservices).

What we are interested at the moment, is generating an API key for the Service - which we will use in our next node.

Have a look at [Locating your service credentials / Understanding your service credentials](https://cloud.ibm.com/docs/Cloudant?topic=Cloudant-locating-your-service-credentials)

The ready instance (with Service credentials):

![Screenshot of Cloudant instance](/2ibm_cloudant/Cloudant-scrnsht_01.png)

### --5th-- Node-RED with cloudantplus node

Installing the [node-red-contrib-cloudantplus](https://github.com/hammoaj/node-red-contrib-cloudantplus) node:

> Node-RED header > main menu > Manage palette > Install

Search for 'cloudantplus' and [install] the node-red-contrib-cloudantplus

Configuring the node is also straightforward and usage is described [here](https://flows.nodered.org/node/node-red-contrib-cloudantplus), and in the help of the nodes.

The configuration node handles the authentication for us, all we need to do is to provide the Host (External endpoint of our Cloudant instance) and the generated API Key.

We can paste these directly into the configuration node, however, since this node uses [IBM Cloudant Node.js SDK](https://www.npmjs.com/package/@ibm-cloud/cloudant), it means that we can make use of setting the environmental variables for IAM authentication ` CLOUDANT_URL=<url> ` and ` CLOUDANT_APIKEY=<apikey> ` - as decribed in [here](https://github.com/IBM/cloudant-node-sdk#authentication-with-environment-variables).

The env variables we add to our Application configuration (on Code Engine instance), and we can do that in the IBM Cloud console UI.

> Code Engine instance > Applications > 'our nodered app' > Configuration > Environment variables

![Screenshot of Code Engine Configuration](/2ibm_cloudant/nodered-on-CodeEngine-envVar-scrnsht_01.png)

In the cloudantplus configuration node we use these variables with ` ${CLOUDANT_URL} ` and ` ${CLOUDANT_APIKEY} ` instead of the credentials.

**Preparing the final message to be sent**

With Node-RED we have the flexibility of modifying data in the flow as we like. For our 'cloudantplus out' node we can configure the msg.payload in the preceding node, easily reshaping it. Since I wanted a timestamp (with current time) in our object, I am adding it to the message.

```javascript
msg.payload = { dev, "timestamp": Date.now(), lat, lon, acc };
```

The object being sent (whole msg object or payload as object) can be configured in the properties of the 'cloudantplus out' node.

Once set, when triggered, the msg.payload travelling from the arduino-iot-cloud node, modified on the way, and coming into our cloudant-node, is sent to the Cloudant instance on IBM Cloud.

### --6th-- Cloudant indexing

Data is nicely flowing, but before we can write a sensible Cloudant Query, we need to Create an Index.

DOCS:
- [Working with IBM Cloudant Query](https://cloud.ibm.com/docs/Cloudant?topic=Cloudant-query)

> Cloudant > 'our database' > Query > Manage Indexes

We will use "timestamp" field, name the index "timestamp-index", and keep it of type "json":

```JSON
{
  "index": {
    "fields": [
      "timestamp"
    ]
  },
  "name": "timestamp-index",
  "type": "json"
}
```

> [ Create Index ]

Now we can query the db, e.g.

```JSON
{
  "selector": {
    "$and": [
      {
        "timestamp": {
          "$gt": 1691359200000
        }
      },
      {
        "dev": 23070002
      }
    ]
  },
  "fields": [
    "dev",
    "timestamp",
    "lat",
    "lon"
  ],
  "sort": [
    {
      "timestamp": "desc"
    }
  ],
  "limit": 50
}
```

This will give us as expected, 50 newest records in the db, no older than 1691359200000 (Aug 07 2023 00:00:00 GMT+0200 (Central European Summer Time)), for the device 23070002, sorted by time.

### --7th-- the whole flow

The whole flow in Node-RED, showing the data inserted into Cloudant db (as seen in the debug from Cloudant response ` "Created" `), and when queried:

![Screenshot of flow](/2ibm_cloudant/nodered-scrnsht_01.png)

A record in our db:

![Screenshot of cloudant db](/2ibm_cloudant/nodered-scrnsht_02_cloudant.png)

Writing a simple query, reveals the record of interest:

![Screenshot of cloudant query](/2ibm_cloudant/nodered-scrnsht_03_cloudant.png)

### SUMMARY

This accomplishes part(1) of what I am after with the project, that is, it gets the data from my boards (via Arduino Cloud) to IBM Cloud, at the moment to Cloudant. The flow happens automatically, recurrently fetching the data from Arduino Cloud at the specified interval. Our db is slowly growing. And we've done almost no coding!

### --additionally--

The collected data in this project is a "Time-series data", so… not wanting an ever-growing Cloudant database, we are going to add the IBM Cloud Object Storage, following a timeboxed database pattern, as explained in "[Time-series Data Storage](https://blog.cloudant.com/2019/04/08/Time-series-data-storage.html)" article.

TO BE CONTINUED IN PART (2)

---------------------------------------------------------------------------
For reference:

- Arduino DOCS for Cloud REST API : [docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/](https://docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/)
- ( Arduino IoT Cloud API Reference ) : [arduino.cc/reference/en/iot/api/](https://www.arduino.cc/reference/en/iot/api/)
- Node-RED User Guide : [nodered.org/docs/user-guide/](https://nodered.org/docs/user-guide/)
- Node-RED with Arduino IoT Cloud : [docs.arduino.cc/arduino-cloud/features/nodered/](https://docs.arduino.cc/arduino-cloud/features/nodered/)
- IBM Cloud IAM (with Identities, Resources, and API keys for service IDs) : [cloud.ibm.com/docs/account?topic=account-iamoverview/](https://cloud.ibm.com/docs/account?topic=account-iamoverview/)
- IBM Cloud : Code Engine DOCS : [cloud.ibm.com/docs/codeengine/](https://cloud.ibm.com/docs/codeengine/)
- and Working with environment variables : [cloud.ibm.com/docs/codeengine?topic=codeengine-envvar](https://cloud.ibm.com/docs/codeengine?topic=codeengine-envvar)
