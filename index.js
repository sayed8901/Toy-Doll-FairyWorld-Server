const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebwgrc3.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const dollCollection = client.db('fairyToyDoll').collection('dolls');



    // to get all toys data
    app.get('/toys', async(req, res) => {
        const result = await dollCollection.find().limit(20).toArray();
        res.send(result);
    })


    // to get single toy data by id
    app.get('/toy/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await dollCollection.findOne(query);
        res.send(result);
    })


    //  to get all toys data of a specific category
    app.get('/toys/:category', async(req, res) => {
        const desiredCategory = req.params.category;
        const query = {category: desiredCategory}
        const result = await dollCollection.find(query).toArray();
        res.send(result);
    })


    // creating index for searching purpose
    const indexKeys = {toyName: 1, category: 1};
    const indexOptions = {name: 'searchByToyNameOrCategory'};
    const newIndex = await dollCollection.createIndex(indexKeys, indexOptions);

    // to get toys data based on partial name search
    app.get('/toySearchByToyNameOrCategory/:inputText', async(req, res) => {
      const searchText = req.params.inputText;
      const query = {
        $or: [
          { toyName: { $regex: searchText, $options: 'i' } },
          { category: { $regex: searchText, $options: 'i' } },
        ]
      }
      const result = await dollCollection.find(query).toArray();
      res.send(result);
    })


    
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
    res.send('FairyWorld is running')
})



app.listen(port, () => {
    console.log(`fairyWorld is running: ${port}`);
})