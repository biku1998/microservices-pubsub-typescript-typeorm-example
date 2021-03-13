import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import "./db";
const app = express();
app.use(express.json());
app.use(helmet());

var accessLogStream = fs.createWriteStream(
  path.join(__dirname, "QueryService.log"),
  {
    flags: "a",
  }
);
app.use(morgan("combined", { stream: accessLogStream }));

const postSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  comments: [
    {
      id: {
        type: Number,
        require: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
});
const Post = mongoose.model("Post", postSchema);

app.get("/posts", async (req, resp) => {
  const posts = await Post.find();
  resp.send({ posts });
});

app.post("/events", async (req, resp) => {
  const event = JSON.parse(
    Buffer.from(req.body.message.data, "base64").toString("utf-8")
  );
  const { type, payload } = event;
  if (type === "postCreated") {
    payload.comments = [];
    const post = new Post(payload);
    await post.save();
  }
  if (type === "commentCreated") {
    const post = await Post.findOne({ id: payload.postId });
    if (post) {
      post.comments.push({ ...payload });
      await post.save();
    }
  }
  resp.send("OK");
});
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log("QueryService running on", PORT);
});
