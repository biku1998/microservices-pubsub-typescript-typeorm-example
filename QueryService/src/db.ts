import mongoose from "mongoose";

mongoose.connect(process.env.DB_URI!, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
