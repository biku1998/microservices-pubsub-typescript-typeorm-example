### Microservices example using

`google pubsub` `typescript` `nodeJs` `postgres` `mongoDB` `typeorm` `mongoose`

---

#### Explanation

We have 3 micro-service

**PostService**

```
purpose : for creating a new post
route : POST /posts
database : postgres with Typeorm ORM
description : whenever a client makes a request with a payload to
create a new post the below action will happen
1. the service will create a new post in the database
2. publish a message to the pubsub topic about the event
i.e 'postCreated' with the required data.
```

**CommentService**

```
purpose : for creating a new comment for a particular post
route : POST /posts/:id/comments
database : postgres with Typeorm ORM
description : whenever a client makes a request with a
payload and a postId to create a new comment the below action will
happen
1. the service will create a new comment for that particular post
in the database
2. publish a message to the pubsub topic about the event
 i.e 'commentCreated' with the required data.
```

**QueryService**

```
purpose : for getting all the posts with their comments and for
handling events pushed from google pubsub
route :
1. POST /events
2. GET /posts
database : mongoDb with mongoose ODM
description :
1. whenever a new post or a comment is created the following
action will happen
a. this service will get a push notification from pubsub and
according to the event and the payload that is coming this service
 will either create a new post or update comments for a given post
 in the database.
2. whenever a user calls GET /posts to get all the posts,
this service will just return all the posts that is present
in the database
```

**How the architecture looks like**

![architecture](/assets/arc.png?raw=true)

**Note**

1. This is just a small scenario on how different services can communicate in an async way.
2. I have only handled a resource creation scenario, resource update and delete scenarios will be added soon.
3. I have just started learning about micro-services so i am sure there will be some downsides of using this architecture feel free to create issues and explain your point of view.

**How to run the project locally**

```
1. create a postgres database and put the database credentials
details inside PostService/config/dev.env and
CommentService/config/dev.env
2. create a mongodb database and put the database credentials
details inside QueryService/config/dev.env
3. on google cloud console
    a. create a service account and download creds
    b. create a pubsub topic
    c. create a push subscription [ use ngrok ]
    d. put all the details inside the env files in PostService and
    CommentService

4. run npm install in all the 3 services and after that npm start
```

**useful links**
https://cloud.google.com/pubsub/docs/quickstart-client-libraries
