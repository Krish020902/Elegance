const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://krishmehta3822:KrishMehta@cluster0.gdzbi3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define user schema
const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  gender: String,
  age: Number,
  wing: String,
  apartment_number: Number,
  entry_time: String,
  exit_time: String,
  total_people_in_batch: Number,
});

const User = mongoose.model("User", userSchema);

app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow requests from any origin
  })
);

// Route to handle POST requests for adding user information
app.post("/add_user", async (req, res) => {
  try {
    const userData = req.body;

    // Validate required fields
    if (
      !userData.name ||
      !userData.surname ||
      !userData.gender ||
      !userData.age ||
      !userData.wing ||
      !userData.apartment_number ||
      !userData.entry_time ||
      !userData.exit_time
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if there are already 5 people with the same entry time
    const count = await User.countDocuments({
      entry_time: userData.entry_time,
    });
    if (count >= 5) {
      return res
        .status(400)
        .json({ error: "Maximum capacity reached for this time slot" });
    }

    // Increment total_people_in_batch for users with the same entry time
    await User.updateMany(
      { entry_time: userData.entry_time },
      { $inc: { total_people_in_batch: 1 } }
    );

    const newUser = new User(userData);
    await newUser.save();

    return res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to handle GET requests to retrieve all users
app.get("/get_users", async (req, res) => {
  try {
    // Retrieve users from the database and sort them by entry_time in ascending order
    const users = await User.find().sort({ entry_time: 1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/delete_users", async (req, res) => {
  try {
    // Delete all documents from the User collection
    await User.deleteMany({});
    return res.status(200).json({ message: "All users deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
