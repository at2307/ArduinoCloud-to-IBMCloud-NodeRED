## From Arduino Cloud to IBM Cloud () - containerized Node-RED on IBM Cloud

This repository documents my minute but coherent project :-) while exploring [IBM Cloud offerings](https://www.ibm.com/cloud/products/) …
and contains code samples (flows and functions written).

The idea behind, is that I would like to get gps coordinates from my arduino boards, to the IBM Cloud, preferably with as little coding as possible (low-code programming), ready for Exploratory Data Analysis.

Documentation is divided into 3 parts:

 - (1) [from Arduino to … Cloudant (JSON document DBaaS)](./2ibm_cloudant)
 - (2) adding COS (Cloud Object Storage) - **IN THE PROCESS**
 - (3) adding RDBMS with geospatial features - **NOT YET IMPLEMENTED**

It is not a comprehensive guide; it assumes that the IBM Cloud account and a local IBM Cloud CLI, as well as the boards sending data to Arduino Cloud are already provisioned.

Starting point links:

 - Arduino Cloud DOCS : [docs.arduino.cc/arduino-cloud/](https://docs.arduino.cc/arduino-cloud/)
 - IBM Cloud DOCS : [cloud.ibm.com/docs/](https://cloud.ibm.com/docs/)
 - IBM Cloud CLI : [cloud.ibm.com/docs/cli/](https://cloud.ibm.com/docs/cli/)
 - IBM Cloud Catalog : [cloud.ibm.com/catalog?search=label%3Aibm_created](https://cloud.ibm.com/catalog?search=label%3Aibm_created)

<!-- As it is my own endeavour, I am the sole contributor and maintainer of this particular project, though I am taking a lot from the community. -->
