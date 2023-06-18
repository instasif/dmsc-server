const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
/*
warner@david.com
Chandpurasi1!
 */
const app = express();

//? ----> middlewares starts
app.use(cors());
app.use(express.json());
//? ----> middlewares ends

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t3kuhjm.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const admissionCollection = client
      .db("dmscDB")
      .collection("admisssionCollection");
    const usersCollection = client.db("dmscDB").collection("usersCollection");
    const teachersCollection = client
      .db("dmscDB")
      .collection("teachersCollection");

    //?-----> verify admin middleware starts
    const verifyAdmin = async (req, res, next) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbiden access" });
      }
      next();
    };
    //?-----> verify admin middleware ends

    //TODO: save admission form datas
    app.post("/admission", async (req, res) => {
      try {
        const admission = req.body;
        const result = await admissionCollection.insertOne(admission);
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

    //Todo: get all admisssion datas
    app.get("/admission", verifyAdmin, async (req, res) => {
      try {
        const filter = {};
        const result = await admissionCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

    //TODO: delete a admission student permanently
    app.delete("/admission/:id", verifyAdmin, async(req, res) =>{
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await admissionCollection.deleteOne(filter);
        res.send(result);

        /*
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await usersCollection.deleteOne(filter);
        res.send(result)
         */
      } catch (error) {
        res.send(error.message);
      }
    })

    //TODO: save users data
    app.post("/users", async (req, res) => {
      try {
        const data = req.body;
        const result = await usersCollection.insertOne(data);
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

    //TODO: get all users data
    app.get("/users", verifyAdmin, async (req, res) => {
      try {
        const filter = {};
        const result = await usersCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

    //TODO: make admin (access by only admins)
    app.put("/users/admin/:id", verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      } catch (error) {
        res.send(error.message);
      }
    });

    //TODO: Delete a user from the db
    app.delete("/users/admin/:id", verifyAdmin, async(req, res) =>{
      try {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await usersCollection.deleteOne(filter);
        res.send(result)
      } catch (error) {
        res.send(error.message);
      }
    })

    //TODO: check user admin or not
    app.get("/users/admin/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email };
        const user = await usersCollection.findOne(query);
        res.send({ isAdmin: user?.role === "admin" });
      } catch (error) {
        res.send(error.message);
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("DMSC server is running...!!");
});

app.listen(port, () => console.log(`DMSC server is running on ${port}`));
