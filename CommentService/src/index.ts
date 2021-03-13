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
  path.join(__dirname, "CommentService.log"),
  {
    flags: "a",
  }
);
app.use(morgan("combined", { stream: accessLogStream }));

@Entity("comments")
class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  content!: string;

  @Column()
  postId!: number;
}

async function initDatabase() {
  try {
    await createConnection({
      type: "postgres",
      host: process.env.DB_URI,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Comment],
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

app.post("/posts/:id/comments", async (req, resp) => {
  const { id: postId } = req.params;
  const { comment: payload } = req.body;
  payload["postId"] = postId;
  const comment = await getRepository(Comment).save(payload);

  // send the event to pubsub
  const dataBuffer = Buffer.from(
    JSON.stringify({
      type: "commentCreated",
      payload: comment,
    })
  );
  await pubSubClient
    .topic(process.env.EVENT_PUBSUB_TOPIC_NAME!)
    .publish(dataBuffer);

  resp.send({ comment });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log("CommentService running on", PORT);
});
