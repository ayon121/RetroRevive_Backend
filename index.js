
const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: 'http://localhost:5173'
}))
app.use(express.json())
//http://localhost:5173/
//https://game-project-7e378.web.app

//const uri = "mongodb+srv://Swarup1970:Swarup1970@cluster0.d4ipkul.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const uri = `mongodb+srv://dataAdmin:ayon1234@cluster0.6rjuyq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// mongodb+srv://dataAdmin:ayon1234@cluster0.6rjuyq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
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
    // await client.connect();
    const database = client.db("GameProjectDB");
    const Gamecollections = database.collection("AllGames");
    const Reviewcollections = database.collection("GamesReviews");
    const usercollections = database.collection("Gameusers");
    const TopGamesCollections = database.collection("TopGames");
    const ProductCollections = database.collection("GameProducts");


    //apis
    //userReviewGetAPI
    // Games Collections Api
    app.get('/games', async (req, res) => {
      const cursor = Gamecollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })
    app.post('/games', async (req, res) => {
      const games = req.body;
      const result = await Gamecollections.insertOne(games);
      res.send(result)

    })
    app.delete('/deletegame/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await Gamecollections.deleteOne(query);
      res.send(result);
    });
    // single reviews by game id
    app.get('/games/:id', async (req, res) => {
      const id = req.params.id;
      const query = { id: id };
      const result = await Gamecollections.find(query).toArray();
      res.send(result)

    })

    // review post
    app.post('/reviews', async (req, res) => {
      const Review = req.body;
      const result = await Reviewcollections.insertOne(Review);
      res.send(result)

    })
    // review get
    app.get('/reviews', async (req, res) => {
      const cursor = Reviewcollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })

    // single reviews by game id
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { gameid: id };
      const Review = await Reviewcollections.find(query).toArray();
      res.send(Review)

    })
    app.put('/editreview/:id', async (req, res) => {
      const reviewId = req.params.id;
      const { ratings, sms } = req.body;

      try {
        // Find the review by its ID
        const review = await Reviewcollections.findOne({ _id: new ObjectId(reviewId) });

        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }

        // Update the review with new data
        await Reviewcollections.updateOne({ _id: new ObjectId(reviewId) }, { $set: { ratings, sms } });

        // Get the updated review
        const updatedReview = await Reviewcollections.findOne({ _id: new ObjectId(reviewId) });

        res.json({ message: 'Review updated successfully', review: updatedReview });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });


    //delete single reviews by game id
    app.delete('/deletereview/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await Reviewcollections.deleteOne(query);
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body
      const query = { email: user.email }
      const existingUser = await usercollections.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }
      const result = await usercollections.insertOne(user)
      res.send(result)
    })
    // all users for admin
    app.get('/users', async (req, res) => {
      const cursor = usercollections.find()
      const result = await cursor.toArray();
      res.send(result)

    })
    //single user
    app.get('/users/:id', async (req, res) => {
      const email = req.params.id
      const query = { email: email };
      const user = await usercollections.find(query).toArray();
      res.send(user)

    })
    // update user make admin
    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          userRole: 'admin'
        }
      }
      const result = await usercollections.updateOne(filter, updateDoc)
      res.send(result)
    })

    // --------------------//
    // Top Games APi
    app.get('/topgames', async (req, res) => {
      const cursor = TopGamesCollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })

    //-------------Game Products---------//
    // home page gaming products
    app.get('/homeproducts', async (req, res) => {
      const cursor = ProductCollections.find()
      const result = await cursor.limit(4).toArray();
      res.send(result)

    })
    //all gaming products
    app.get('/allproducts', async (req, res) => {
      const cursor = ProductCollections.find()
      const result = await cursor.toArray();
      res.send(result)
    })

    //add gaming products
    app.post('/addproduct', async (req, res) => {
      const product = req.body;
      const result = await ProductCollections.insertOne(product);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Ayon Game Project server is running')
})

app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})  
