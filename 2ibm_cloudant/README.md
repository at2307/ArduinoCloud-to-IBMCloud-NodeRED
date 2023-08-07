## from Arduino to … Cloudant (JSON document DBaaS)

To start the project we need _something_ (to receive, to store, and to make things talk to each other).
For instance _something_ working on the IBM Cloud that will fetch our data. This _something_ could be e.g. a function triggered periodically, but we want this _something_ to do more and to provide a flexibility of changing or adding to the whole flow of data.

We do not want to be "writing" a server application, but we need _something_ that can act as a backend (or middleware if you prefer) app for us, so why not [Node-RED](https://nodered.org/)? A flow-based programming tool, to connect nodes that form a flow to accomplish what we want to do.

If you read the docs you will find that one of the ways to run Node-RED on IBM Cloud is through the [IBM Cloud Code Engine](https://www.ibm.com/cloud/code-engine/) (deployment target) instance. So that's what we will start with.

Before making any steps, it's worth having a look at:
- Arduino Cloud REST API : [docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/](https://docs.arduino.cc/arduino-cloud/getting-started/arduino-iot-api/)
- Node-RED with Arduino IoT Cloud : [docs.arduino.cc/arduino-cloud/features/nodered/](https://docs.arduino.cc/arduino-cloud/features/nodered/)

- IBM Cloud IAM (with Identities, Resources, and API keys for service IDs) : [cloud.ibm.com/docs/account?topic=account-iamoverview/](https://cloud.ibm.com/docs/account?topic=account-iamoverview/)

- IBM Cloud : Code Engine DOCS : [cloud.ibm.com/docs/codeengine/](https://cloud.ibm.com/docs/codeengine/)
- and Working with environment variables : [cloud.ibm.com/docs/codeengine?topic=codeengine-envvar](https://cloud.ibm.com/docs/codeengine?topic=codeengine-envvar)

**1st**
…
