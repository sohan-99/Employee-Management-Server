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
    // await client.connect();
    const serviceCollection = client.db('employeeManagementDB').collection('servicetype');
    const usersCollection = client.db("employeeManagementDB").collection("users");

     // jwt related api
     app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

      // middlewares 
      // const verifyToken = (req, res, next) => {
      //   console.log('inside verify token', req.headers.authorization);
      //   if (!req.headers.authorization) {
      //     return res.status(401).send({ message: 'unauthorized access' });
      //   }
      //   const token = req.headers.authorization.split(' ')[1];
      //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      //     if (err) {
      //       return res.status(401).send({ message: 'unauthorized access' })
      //     }
      //     req.decoded = decoded;
      //     next();
      //   })
      // }

       // use verify admin after verifyToken
    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   const isAdmin = user?.
    //   designation === 'admin';
    //   if (!isAdmin) {
    //     return res.status(403).send({ message: 'forbidden access' });
    //   }
    //   next();
    // }


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
    app.get("/users/:email",  async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // all employee get and show in website
    app.get('/users',  async (req, res) => {
      console.log(req.headers);
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

      //all employee list api  
      app.get("/allemployee", async (req, res) => {
        const filter = { designation: "Employee" };
        const result = await usersCollection.find(filter).toArray();
        res.send(result);
      });


   
  } finally {
   
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Employee-managment-server is runing')
})

app.listen(port, () => {
  console.log(`this is port :${port}`);
})
