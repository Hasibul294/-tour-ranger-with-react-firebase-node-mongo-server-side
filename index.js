const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ua7v2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("tourRanger");
    const packageCollection = database.collection("packages");
    const bookingCollection = database.collection("booking");

    //Get API
    app.get("/packages", async (req, res) => {
      const cursor = packageCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });

    //Dynamic API
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const package = await packageCollection.findOne(query);
      res.json(package);
    });

    //Post API
    app.post("/packages", async (req, res) => {
      const package = req.body;
      const result = await packageCollection.insertOne(package);
      res.json(result);
    });

    //Booking Post API
    app.post("/packages/booking", async (req, res) => {
      const booking = req.body;
      booking.status = "pending";
      const result = await bookingCollection.insertOne(booking);
      res.json(result);
    });

    //User Order Get API
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { email: id };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    //Orders Get API
    app.get("/orders", async (req, res) => {
      const cursor = bookingCollection.find({});
      const booking = await cursor.toArray();
      res.send(booking);
    });

    //Update API
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "confirm",
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });

    //Delete API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World! I am running");
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
