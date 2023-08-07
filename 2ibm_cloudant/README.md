**From Arduino Cloud to IBM Cloud () - containerized Node-RED on IBM Cloud**
## (1) from Arduino to … Cloudant (JSON document DBaaS)

To start the project we need _something_ (to receive, to store, and to make things talk to each other).

We do not want to be "writing" a server application, but we need _something_ that can act as a backend (or middleware if you prefer) app for us, so why not [Node-RED](https://nodered.org/)? A flow-based programming tool, to connect nodes that form a flow to accomplish what we want to do.

If you read the docs you will find that one of the ways to run Node-RED on IBM Cloud is through the [IBM Cloud Code Engine](https://www.ibm.com/cloud/code-engine/) (deployment target) instance. So, for the purpose of this project, we will use the following resources:

- [Arduino IoT Cloud](https://cloud.arduino.cc/how-it-works/) -- an online platform with data from our boards
- [IBM Cloud : Code Engine](https://www.ibm.com/cloud/code-engine/) -- a serverless PaaS running a containerized app
- Node-RED Docker image -- from a Docker Hub repository
- An [@arduino/node-red-contrib-arduino-iot-cloud](https://github.com/arduino/node-red-contrib-arduino-iot-cloud) contribution node -- to get the data from Arduino Cloud
- [IBM Cloud : Cloudant](https://www.ibm.com/products/cloudant/) -- JSON document DBaaS for IoT and serverless applications, based on Apache CouchDB - a straightforward solution to quickly get our data into IBM Cloud
- A [node-red-contrib-cloudantplus](https://github.com/hammoaj/node-red-contrib-cloudantplus) contribution node -- to insert data into Cloudant

### --1st-- Arduino Cloud

From the [Arduino DOCS for Cloud REST API](https://docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api) we know that we need to authenticate with a `clientId` and `clientSecret`. Once logged in to Arduino Cloud, simply navigate to "[API keys](https://cloud.arduino.cc/home/api-keys/)" and click "CREATE API KEY" (note the values). For now, that's all we need.

### --2nd-- IBM Cloud : Code Engine with Node-RED Docker image

[...]

### --3rd-- Node-RED with Arduino-iot-cloud node

Of interest: [Arduino iot-api Javascript client](https://www.npmjs.com/package/@arduino/arduino-iot-client/)
```
client_id: 'YOUR_CLIENT_ID'
client_secret: 'YOUR_CLIENT_SECRET'
```

### --4th-- IBM Cloud : Cloudant

[...]

### --5th-- Node-RED with cloudantplus node

[...]

The [node-red-contrib-cloudantplus](https://github.com/hammoaj/node-red-contrib-cloudantplus) node uses [IBM Cloudant Node.js SDK](https://www.npmjs.com/package/@ibm-cloud/cloudant)

of interest: [github.com/IBM/cloudant-node-sdk](https://github.com/IBM/cloudant-node-sdk#authentication-with-environment-variables) - useful if setting (yes) environmental variables for IAM authentication `CLOUDANT_URL=<url>`.

### --6th-- the whole flow

The whole flow in Node-RED, showing the data inserted into Cloudant db (as seen in the debug from Cloudant response ` "Created" `), and when queried:

![Screenshot of flow](/2ibm_cloudant/nodered-scrnsht_01.png)

A record in our db:

![Screenshot of flow](/2ibm_cloudant/nodered-scrnsht_02_cloudant.png)

Writing a simple query, reveals the record:

![Screenshot of flow](/2ibm_cloudant/nodered-scrnsht_03_cloudant.png)


### --additionally--

The collected data in this project is a "Time-series data", so… not wanting an ever-growing Cloudant database, we are going to add the IBM Cloud Object Storage, following a timeboxed database pattern, as explained in "[Time-series Data Storage](https://blog.cloudant.com/2019/04/08/Time-series-data-storage.html)" article.

TO BE CONTINUED IN PART (2)

---------------------------------------------------------------------------
For reference:

- Arduino DOCS for Cloud REST API : [docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/](https://docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/)
- ( Arduino IoT Cloud API Reference ) : [arduino.cc/reference/en/iot/api/](https://www.arduino.cc/reference/en/iot/api/)
- Node-RED with Arduino IoT Cloud : [docs.arduino.cc/arduino-cloud/features/nodered/](https://docs.arduino.cc/arduino-cloud/features/nodered/)
- IBM Cloud IAM (with Identities, Resources, and API keys for service IDs) : [cloud.ibm.com/docs/account?topic=account-iamoverview/](https://cloud.ibm.com/docs/account?topic=account-iamoverview/)
- IBM Cloud : Code Engine DOCS : [cloud.ibm.com/docs/codeengine/](https://cloud.ibm.com/docs/codeengine/)
- and Working with environment variables : [cloud.ibm.com/docs/codeengine?topic=codeengine-envvar](https://cloud.ibm.com/docs/codeengine?topic=codeengine-envvar)
