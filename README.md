# hyper-cdn
## Background
**Content Delivery Network** or **Content Distribution Network** (**CDN**) is a globally distributed network of proxy servers deployed in multiple data centers. The goal of a CDN is to serve content to end-users with high availability and high performance. CDNs serve a large fraction of the Internet content today, including web objects (text, graphics and scripts), downloadable objects (media files, software, documents), applications (e-commerce, portals), live streaming media, on-demand streaming media, and social networks[\[1\]](https://en.wikipedia.org/wiki/Content_delivery_network).

Many business companies now have provided distributed server for CDN usage. But it's too costly. CDN users may need to pay several million dollars one year for CDN services.

On the other hand, many end users have extra storage and network bandwidth, but they cannot be found be CDN network, thus cannot make good use of their extra resources.

To combine CDN users and end users who have the ability to provide CDN service, therefore becomes a big challenge.

## Project Overview
### Project Structure
* **movie-candy** :CDN users
* **cdn-provider** :CDN network dashboard
* **chaincode**: chaincode for CDN network

