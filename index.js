const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
// middlewere
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.julqny1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db('employeeManagementDB').collection('servicetype');
    const usersCollection = client.db("employeeManagementDB").collection("users");

    // get all data to database 
    app.get('/servicetype', async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result)
    })

    // get data in service name 
    app.get('/servicetype/:service_name', async (req, res) => {
      const service_name = req.params.service_name
      const query = { service_name: service_name }
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })

    //user created 
    app.post("/users", async (req, res) => {
      const query = req.body;
      const result = await usersCollection.insertOne(query);
      res.send(result);
    });

    // check role 
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // all employee get and show in website
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })

    // employee deleted api
    app.delete('/users/:id',  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

      //make HR api 
      app.patch('/users/hr/:id',  async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            designation: 'HR'
          }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      })

      // 


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('coffe-store-server is runing')
})

app.listen(port, () => {
  console.log(`this is port :${port}`);
})
