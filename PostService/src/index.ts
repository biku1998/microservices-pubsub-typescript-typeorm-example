import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import {
  createConnection,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  getRepository,
} from "typeorm";
import { PubSub } from "@google-cloud/pubsub";
const app = express();
app.use(express.json());
app.use(helmet());

var accessLogStream = fs.createWriteStream(
  path.join(__dirname, "PostService.log"),
  {
    flags: "a",
  }
);
app.use(morgan("combined", { stream: accessLogStream }));

@Entity("posts")
class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  content!: string;
}

async function initDatabase() {
  try {
    await createConnection({
      type: "postgres",
      host: process.env.DB_URI,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Post],
      logging: true,
      logger: "advanced-console",
      synchronize: true,
    });
    console.log("Database : Connected successfully");
  } catch (err) {
    console.log("Database : Failed to connect");
    console.log(err);
  }
}

initDatabase();
const pubSubClient = new PubSub();
app.post("/posts", async (req, resp) => {
  const { post: payload } = req.body;
  const post = await getRepository(Post).save(payload);

  // send the event to pubsub
  const dataBuffer = Buffer.from(
    JSON.stringify({
      type: "postCreated",
      payload: post,
    })
  );
  await pubSubClient
    .topic(process.env.EVENT_PUBSUB_TOPIC_NAME!)
    .publish(dataBuffer);
  resp.send({ post });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("PostService running on", PORT);
});
