// Express server setup
const express = require("express");
const app = express();
app.use(express.json());

// MongoDB setup
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://vignesh:Ka7x2wGQXiBNomMu@cluster0.2zrfree.mongodb.net/"
);
// useNewUrlParser: true,
// useUnifiedTopology: true,

// Mentor schema and model
const mentorSchema = new mongoose.Schema({
  name: String,
  // Add other mentor details here
});

const Mentor = mongoose.model("Mentor", mentorSchema);

// Create Mentor API endpoint
app.post("/mentors", async (req, res) => {
  try {
    const { name } = req.body;
    const mentor = new Mentor({ name });
    await mentor.save();
    res.status(201).json({ message: "Mentor created successfully", mentor });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating mentor", error: error.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Assuming this is in a file where you define your models

// const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  // Add other student details here
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor", // Reference to the Mentor model
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student; // Export the Student model
// Import the Student model
// const Student = require("./models/student"); // Adjust the path based on your file structure

// Create Student API endpoint
app.post("/students", async (req, res) => {
  try {
    const { name } = req.body;
    const student = new Student({ name });
    await student.save();
    res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating student", error: error.message });
  }
});

// Assuming your API endpoint for assigning a student to a mentor
app.post("/assign-mentor/:mentorId/:studentId", async (req, res) => {
  try {
    const { mentorId, studentId } = req.params;

    // Check if mentorId and studentId are valid ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(mentorId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({ message: "Invalid mentorId or studentId" });
    }

    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    // Check if mentor and student exist
    if (!mentor || !student) {
      return res.status(404).json({ message: "Mentor or student not found" });
    }

    // Check if the student already has a mentor assigned
    if (student.mentor) {
      return res.status(400).json({ message: "Student already has a mentor" });
    }

    // Assign the student to the mentor
    student.mentor = mentor._id;
    await student.save();

    res
      .status(200)
      .json({ message: "Student assigned to mentor successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error assigning student to mentor",
      error: error.message,
    });
  }
});
app.get("/students-without-mentor", async (req, res) => {
  try {
    const studentsWithoutMentor = await Student.find({
      mentor: { $exists: false },
    });
    res.status(200).json({ studentsWithoutMentor });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching students without a mentor",
      error: error.message,
    });
  }
});

// Change Mentor for Student API endpoint
app.put("/change-mentor/:studentId/:newMentorId", async (req, res) => {
  try {
    const { studentId, newMentorId } = req.params;

    // Check if studentId and newMentorId are valid ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(newMentorId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid studentId or newMentorId" });
    }

    // Retrieve the student and new mentor within the async function
    const student = await Student.findById(studentId);
    const newMentor = await Mentor.findById(newMentorId);

    // Check if the student and new mentor exist
    if (!student || !newMentor) {
      return res
        .status(404)
        .json({ message: "Student or new mentor not found" });
    }

    // Change the mentor for the student
    student.mentor = newMentor._id;
    await student.save();

    res
      .status(200)
      .json({ message: "Mentor changed for student successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error changing mentor for student",
      error: error.message,
    });
  }
});

// Show previously assigned mentor for a particular student API endpoint
app.get("/student-previous-mentor/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if studentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }

    const student = await Student.findById(studentId).populate("mentor");

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const previousMentor = student.mentor;
    res.status(200).json({ previousMentor });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching previous mentor for student",
      error: error.message,
    });
  }
});
