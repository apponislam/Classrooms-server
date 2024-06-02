const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// app.use(
//     cors({
//         origin: ["http://localhost:5173", "https://assignmentb9a12.web.app", "https://assignmentb9a12.firebaseapp.com"],
//         credentials: true,
//     })
// );

app.use(cors());

app.use(express.json());

app.get("/", function (req, res) {
    res.send("Classroom server is running");
});

// const uri = "mongodb+srv://ApponClassroom:aHsxhUhBCGbmhKow@cluster0.4bvpsnf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4bvpsnf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const allUsers = client.db("ClassroomDB").collection("Users");
        const allClasses = client.db("ClassroomDB").collection("Classes");

        // All Users

        app.get("/Users", async (req, res) => {
            const result = await allUsers.find().toArray();
            res.send(result);
        });

        app.get("/Users/email/:email", async (req, res) => {
            const { email } = req.params;
            const query = { email: email };
            const cursor = allUsers.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post("/Users", async (req, res) => {
            const user = req.body;
            const existingUser = await allUsers.findOne({ email: user.email });
            if (existingUser) {
                return res.status(400).send({ message: "User already exists" });
            }
            const result = await allUsers.insertOne(user);
            res.send(result);
        });

        // All Classes

        app.get("/Classes", async (req, res) => {
            const result = await allClasses.find().toArray();
            res.send(result);
        });

        app.get("/Classes/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allClasses.findOne(query);
            res.send(result);
        });

        app.patch("/Classes/:id", async (req, res) => {
            const id = req.params.id;
            const statusUpdate = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateClass = {
                $set: {
                    status: statusUpdate.status,
                },
            };
            const result = await allClasses.updateOne(filter, updateClass);
            res.send(result);
        });

        app.post("/Classes", async (req, res) => {
            const Class = req.body;
            const result = await allClasses.insertOne(Class);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Port is running on ${port}`);
});
