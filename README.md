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
description : whenever a client makes a request with a payload to create a new post the below action will happen
1. the service will create a new post in the database
2. publish a message to the pubsub topic about the event i.e 'postCreated' with the required data.
```

**CommentService**

```
purpose : for creating a new comment for a particular post
route : POST /posts/:id/comments
database : postgres with Typeorm ORM
description : whenever a client makes a request with a payload and a postId to create a new comment the below action will happen
1. the service will create a new comment for that particular post in the database
2. publish a message to the pubsub topic about the event i.e 'commentCreated' with the required data.
```

**QueryService**

```
purpose : for getting all the posts with their comments and for handling events pushed from google pubsub
route :
1. POST /events
2. GET /posts
database : mongoDb with mongoose ODM
description :
1. whenever a new post or a comment is created the following action will happen
a. this service will get a push notification from pubsub and according to the event and the payload that is coming this service will either create a new post or update comments for a given post in the database.
2. whenever a user calls GET /posts to get all the posts this service will just return all the posts that is present in the database
```

**How the architecture looks like**
![architecture](/assets/arc.png?raw=true)
