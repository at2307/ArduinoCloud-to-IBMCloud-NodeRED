# From Arduino Cloud to IBM Cloud () - containerized Node-RED on IBM Cloud
## (1) from Arduino to … Cloudant (JSON document DBaaS)

To start the project we need _something_ (to receive, to store, and to make things talk to each other).

We do not want to be "writing" a server application, but we need _something_ that can act as a backend (or middleware if you prefer) app for us, so why not [Node-RED](https://nodered.org/)? A flow-based programming tool, to connect nodes that form a flow to accomplish what we want to do.

If you read the docs you will find that one of the ways to run Node-RED on IBM Cloud is through the [IBM Cloud Code Engine](https://www.ibm.com/cloud/code-engine/) (deployment target) instance. So, for the purpose of this project, we will use following resources:

- [Arduino IoT Cloud](https://cloud.arduino.cc/how-it-works/) -- an online platform with data from our boards
- [IBM Cloud : Code Engine](https://www.ibm.com/cloud/code-engine/) -- a serverless PaaS running a containerized app
- Node-RED Docker image -- from a Docker Hub repository
- An [@arduino/node-red-contrib-arduino-iot-cloud](https://github.com/arduino/node-red-contrib-arduino-iot-cloud) contribution node -- to get the data from Arduino Cloud
- A [node-red-contrib-cloudantplus](https://github.com/hammoaj/node-red-contrib-cloudantplus) contribution node -- to access Cloudant
- [IBM Cloud : Cloudant](https://www.ibm.com/products/cloudant/) -- JSON document DBaaS for IoT and serverless applications, based on Apache CouchDB - a straightforward solution to quickly get the data into IBM Cloud


### 1st: Arduino Cloud

required: [api-keys](https://cloud.arduino.cc/home/api-keys/)

of interest: [Arduino iot-api Javascript client](https://www.npmjs.com/package/@arduino/arduino-iot-client/)
```
client_id: 'YOUR_CLIENT_ID'
client_secret: 'YOUR_CLIENT_SECRET'
```

[...]


### (n)th: Cloudant node

The [node-red-contrib-cloudantplus](https://github.com/hammoaj/node-red-contrib-cloudantplus) node uses [IBM Cloudant Node.js SDK](https://www.npmjs.com/package/@ibm-cloud/cloudant)

of interest: [github.com/IBM/cloudant-node-sdk](https://github.com/IBM/cloudant-node-sdk#authentication-with-environment-variables) - useful if setting (yes) environmental variables for IAM authentication
```
CLOUDANT_URL=<url>
```

[...]

### (n)th: the whole flow

[...]

Writing a simple query, reveals the record in our db:

![Screenshot of flow](/2ibm_cloudant/nodered-scrnsht_03_cloudant.png)


### -- additionally --

The collected data in this project is a "Time-series data", so… not wanting an ever-growing Cloudant database, we are going to add the IBM Cloud Object Storage, following a timeboxed database pattern, as explained in "[Time-series Data Storage](https://blog.cloudant.com/2019/04/08/Time-series-data-storage.html)" article.

TO BE CONTINUED IN PART (2)

---------------------------------------------------------------------------
For reference:

- Arduino Cloud REST API : [docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/](https://docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/)
- Node-RED with Arduino IoT Cloud : [docs.arduino.cc/arduino-cloud/features/nodered/](https://docs.arduino.cc/arduino-cloud/features/nodered/)
- IBM Cloud IAM (with Identities, Resources, and API keys for service IDs) : [cloud.ibm.com/docs/account?topic=account-iamoverview/](https://cloud.ibm.com/docs/account?topic=account-iamoverview/)
- IBM Cloud : Code Engine DOCS : [cloud.ibm.com/docs/codeengine/](https://cloud.ibm.com/docs/codeengine/)
- and Working with environment variables : [cloud.ibm.com/docs/codeengine?topic=codeengine-envvar](https://cloud.ibm.com/docs/codeengine?topic=codeengine-envvar)
