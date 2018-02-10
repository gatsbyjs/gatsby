---
title: "Creative Software Destruction and the New Presentation Layer"
date: "2018-01-24"
author: "Robin Vasan"
---

> “To improve is to change, so to be perfect is to have changed often.” — Winston Churchill

And so it is that about every decade the technology industry rethinks the application architecture in light of new systems, capabilities, and desired outcomes. Right now we are in the early phases of another platform shift which will have massive ripple effects throughout the technology landscape. Current incumbents will fade in significance and new entrants will take their place within new categories. Hundreds of billions in market capitalization is at stake.

This process of creative destruction tends to begin within the infrastructure sector but eventually has broad impact across the whole stack. Most of the attention in recent years has been focused around transforming the backend with the adoption of containers and microservices. Mobile has brought about changes to the presentation layer, but the timing is right for a more fundamental change in the presentation layer architecture — and the seeds of that change have begun.

## Where Have We Come From?

During the late-1980s the industry converged around the client-server model. While there were challengers, eventually Windows (it took until version 3.1!) emerged as the dominant end-user client environment. The applications in this era were relatively small, specific to a single operating system, and typically built for hundreds or thousands of users. In designing these applications, the choice was really whether you put the business logic directly into the client application or pushed it down into the database. Unix systems became the dominant server platforms largely based upon database performance requirements.

The availability of the internet, and the birth of the browser — thank you, Marc Andreessen — greatly simplified cross-platform client development. However, these new applications now had to support several orders of magnitude more users. Consequently, several new tiers were added to the architecture: the web server and the application server. The web server and associated proxies and load balancers provided a stateless layer to handle the presentation layer. The application server became the obvious place for the business logic and to manage the interaction with the (typically relational) database server.

As a result, developers struggled with the challenges of shifting from UI code to object-oriented programming models to the definition of underlying data schemas. In fact, much of the evolution in programming frameworks and libraries in the last decade or more has been aimed at solving this dissonance. Finally, these platforms were either extremely expensive to vertically scale or operationally challenging to horizontally scale.

## Where Are We Now?

The power within IT has clearly moved from infrastructure teams to application teams. Developers and architects prefer to think in services and they expect the infrastructure to be programmable, cheap, elastic, and secure. They no longer want to worry about low-level concerns of infrastructure management and instead, they want frictionless and limitless capabilities and then access to APIs for other services to help them compose applications. We are moving more toward an application- or service-centric model as opposed to an infrastructure-centric approach.

Things are still evolving, but some of the elements of this new “cloud-native” architecture appear clear and include:

* **Cloud**. Public or private cloud infrastructure provides the base services of compute, storage and networking. AWS, Azure, and Google are all racing to add more and more infrastructure and application services — though architects should actively consider finding abstractions that give them portability.
* **Containers**: Containers provide the packaging format for how to build and deploy software as components. In earlier generations we were forced to think in larger constructs (.exe or jar files) that were sometimes tied to the underlying hardware, operating systems or runtimes.
* **Microservices**: Microservices are components with well-defined API interfaces. This allows different parts of the system to evolve much more frequently and to scale independently. It also embraces the use of third-party operated services for common components like identity/auth, payments and more.
* **Application Management**: Application servers have been replaced by cluster management solutions like Kubernetes. Virtualization was an intermediate step along the path to more elastic distributed systems. By leveraging the new cluster schedulers, systems can much more easily be built to be horizontally scalable and resilient.
* **Polyglot Data**: Pick as many different data solutions as necessary depending on the different types of data and how it is accessed. Clearly, the SQL-based world of relational and analytics databases still matter, but very common data structures and access patterns now include: key/value caching, document/JSON, search, object, metrics/time-series and perhaps a few others. All of these new database solutions need to be natively distributed systems and simple to operate at any scale.

These aspects all address the architecture for the backend application services and data. In this shift, open source software is prevalent and playing a critical role in every category of infrastructure software. Enterprise adoption of open source has skyrocketed as these open source solutions have been built specifically for cloud deployment and horizontal scalability.

## What’s Next?

It is trite but true to say that every company is becoming a software company. This focus on digital transformation means that businesses are using apps and experiences as the primary interface to the customer. Most of the emphasis to date has been solving the backend services for digital transformation. But as an industry, we haven’t rethought the front-end presentation layer architecture which is a vital part of that new customer interface.

We now live in a world of cheap compute and storage, cloud/edge capabilities, and generally fast and pervasive network coverage. So it seems the time has come to dramatically improve the presentation layer. In this world, for instance, running traditional web servers and web content management systems may not make sense anymore. It is incredibly inefficient to have a web server talking to a content management system to pull information, create a response page and send it back to the user. Serverless is gaining interest in terms of the back end architecture, so why not apply a similar approach to the presentation layer?

For developers, there has always been rapid evolution in the area of presentation layer languages and frameworks. With the backing of Facebook (and fixing the open source licensing!), React may finally unify mobile and web client development. Developers have also been actively adopting API-driven headless CMS solutions. Another Facebook technology called GraphQL could provide a unified abstraction to backend data and services.

Based on these new technologies, it seems that we can move to a new serverless presentation layer architecture with pre-built JavaScript code served from cloud/edge caches talking directly to backend or third-party microservices. Web and content management servers are no longer runtime components and instead, there is a process to build and deploy static or pre-compiled experiences. This new serverless architecture provides a number of dramatic improvements over the current approach, including:

* **Performance**: Pages load much faster since they are served from caches, which are ideally geographically distributed.
* **Security**: The attack surface is greatly reduced since you no longer have runtime web and CMS components that can be compromised.
* **Cost**: The cost is completely variable and directly to usage, instead of having to size and pay for peak capacity.
* **Scalability**: The presentation layer is completely elastic and requires no intervention to scale up and down.
* **Operations**: There are no servers to manage.
* **Agility**: The process of iterating on the user experience is greatly accelerated. Designers, developers and teams are able to leverage a familiar and tightly woven set of workflows and pipelines: from source code management through to the desired cloud platform.

There are lots of pieces to this puzzle to still work out, but the shapes are starting to come into focus. The end result should be a streamlined process to design, build, test, and deploy new user experiences. And the resulting applications should be much faster, simpler to operate, cheaper to run, and more secure.

> “Some people don’t like change, but you need to embrace change if the alternative is disaster” — Elon Musk.
