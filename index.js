require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
// const stripe = require("stripe")("sk_test_51POH2H003ufns5WKI0hARgSJC9LZGnWc8CXiN8Xs1pesTbtJnXmZou5zjNkqtydX6GnQ4dCgSRxE3yVZ9dtD2uId00Ia2e32g3");

const app = express();
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

// console.log(process.env.STRIPE_SECRET);

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
        const paymnetInfo = client.db("ClassroomDB").collection("paymnetInfo");
        const classAssignment = client.db("ClassroomDB").collection("assignmentInfo");

        // All Users

        app.get("/Users", async (req, res) => {
            const result = await allUsers.find().toArray();
            res.send(result);
        });

        app.patch("/Users/:id", async (req, res) => {
            const id = req.params.id;
            const updateUser = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateAdmin = {
                $set: {
                    role: updateUser.role,
                },
            };
            const result = await allUsers.updateOne(filter, updateAdmin);
            res.send(result);
        });

        app.get("/PendingUsers", async (req, res) => {
            const result = await allUsers
                .find({
                    status: { $in: ["rejected", "pending", "accepted"] },
                })
                .toArray();
            res.send(result);
        });

        app.patch("/PendingUsers/:id", async (req, res) => {
            const id = req.params.id;
            const updateUser = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateTeacher = {
                $set: {
                    role: updateUser.role,
                    status: updateUser.status,
                },
            };
            const result = await allUsers.updateOne(filter, updateTeacher);
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

        app.put("/Users/email/:email", async (req, res) => {
            const { email } = req.params;
            const requestTeacher = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: requestTeacher.status,
                    category: requestTeacher.category,
                    experience: requestTeacher.experience,
                    title: requestTeacher.title,
                    name: requestTeacher.name,
                    imagelink: requestTeacher.image,
                },
            };
            const result = await allUsers.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // All Classes
        // All Classes
        // All Classes
        // All Classes
        // All Classes
        // All Classes
        // All Classes
        // All Classes

        app.get("/Classes", async (req, res) => {
            const result = await allClasses.find().toArray();
            res.send(result);
        });

        app.get("/Classes/email/:email", async (req, res) => {
            const { email } = req.params;
            const query = { email: email };
            const cursor = allClasses.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/Classes/Approved/Home", async (req, res) => {
            const query = { status: "approved" };
            const cursor = allClasses.find(query).sort({ enroll: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/Classes/Approved", async (req, res) => {
            const query = { status: "approved" };
            const cursor = allClasses.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/Classes/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allClasses.findOne(query);
            res.send(result);
        });

        app.put("/Classes/:id", async (req, res) => {
            const id = req.params.id;
            const updateTeacherClass = req.body;
            const filter = { _id: new ObjectId(id) };
            const option = { upsert: true };
            const updateClass = {
                $set: {
                    title: updateTeacherClass.title,
                    description: updateTeacherClass.description,
                    image: updateTeacherClass.image,
                    price: updateTeacherClass.price,
                },
            };
            const result = await allClasses.updateOne(filter, updateClass, option);
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

        app.patch("/Classes/Enroll/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateClass = {
                $inc: { enroll: 1 },
            };
            const result = await allClasses.updateOne(filter, updateClass);
            res.send(result);
        });

        app.patch("/Classes/assignments/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateClass = {
                $inc: { assignments: 1 },
            };
            const result = await allClasses.updateOne(filter, updateClass);
            res.send(result);
        });

        app.post("/Classes", async (req, res) => {
            const Class = req.body;
            const result = await allClasses.insertOne(Class);
            res.send(result);
        });

        app.delete("/Classes/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allClasses.deleteOne(query);
            res.send(result);
        });

        // Class Assignment
        // Class Assignment
        // Class Assignment
        // Class Assignment

        app.get("/Assignments", async (req, res) => {
            const result = await classAssignment.find().toArray();
            res.send(result);
        });

        app.get("/Assignments/ClassId/:id", async (req, res) => {
            const id = req.params.id;
            const query = { classId: id };
            const result = await classAssignment.find(query).toArray();
            res.send(result);
        });

        app.post("/Assignments", async (req, res) => {
            const Assignment = req.body;
            const result = await classAssignment.insertOne(Assignment);
            res.send(result);
        });

        // Payment Info
        // Payment Info
        // Payment Info
        // Payment Info

        app.get("/PaymentInfo", async (req, res) => {
            const result = await paymnetInfo.find().toArray();
            res.send(result);
        });

        app.get("/PaymentInfo/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await paymnetInfo.findOne(query);
            res.send(result);
        });

        app.get("/PaymentInfo/email/:email", async (req, res) => {
            const { email } = req.params;
            const query = { email: email };
            const cursor = paymnetInfo.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post("/PaymentInfo", async (req, res) => {
            const Class = req.body;
            const result = await paymnetInfo.insertOne(Class);
            res.send(result);
        });

        // ALL Payment
        // ALL Payment
        // ALL Payment
        // ALL Payment
        // ALL Payment
        // ALL Payment

        // app.post("/Payment", async (req, res) => {
        //     const { Class } = req.body;
        //     // console.log(Class);
        //     const session = await stripe.checkout.sessions.create({
        //         payment_method_types: ["card"],
        //         line_items: [
        //             {
        //                 price_data: {
        //                     currency: "usd",
        //                     product_data: {
        //                         name: Class.name,
        //                         description: Class.description,
        //                     },
        //                     unit_amount: parseInt(Class.price * 100), // price in cents
        //                 },
        //                 quantity: 1,
        //             },
        //         ],
        //         mode: "payment",
        //         success_url: "http://localhost:5173/dashboard/myenroll-class",
        //         cancel_url: "http://localhost:5173/AllClass",
        //     });

        //     res.json({ id: session.id });
        // });

        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            // console.log(price);
            const amount = parseInt(price * 100);
            // console.log(amount);

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ["card"],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
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
