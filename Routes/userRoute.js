// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../Model/User'); // Assuming your User model is in models/User.js
const Resume = require('../Model/Resume');
const upload = require('../middleware/multer')
const PDFDocument = require('pdfkit');
const path = require('path');
const mongoose = require("mongoose");

router.post('/', async (req, res) => {
    const { uid, name, email, photo, subscription } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (!user) {
            // Create a new user
            user = new User({
                uid,
                name,
                email,
                photo,
                subscription
            });
            await user.save();
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to get user data by uid
router.get('/:uid', async (req, res) => {
    const { uid } = req.params;
    console.log(uid);
    try {
        // Find the user by uid
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user');
    }
});



// Create or update resume
router.post('/resumes', upload.single('photo'), async (req, res) => {
    const { userId, fullName, qualification, experience,por,courses,projects,skills, personalDetails } = req.body;
    const photo = req.file ? req.file.path : null;
  
    try {
      let resume = await Resume.findOne({ userId });
      if (resume) {
        resume.fullName = fullName;
        resume.qualification = qualification;
        resume.experience = experience;
        resume.personalDetails = personalDetails;
        resume.photo = photo || resume.photo;
        resume.por = por;
        resume.courses = courses;
        resume.projects = projects;
        resume.skills = skills;
        resume = await resume.save();
      } else {
        resume = new Resume({ userId, fullName, qualification, experience,por,courses,projects,skills, personalDetails, photo });
        await resume.save();
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

  // get resume by resumeId
  router.get('/resum/:id', async (req, res) => {
    try {
      const resumeId = req.params.id;
      console.log(resumeId)
      // Validate the ID format
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
          return res.status(400).send({ error: "Invalid resume ID format" });
      }

      const resume = await Resume.findById(resumeId);

      if (!resume) {
          return res.status(404).send({ error: "Resume not found" });
      }

      res.status(200).send(resume);
  } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).send({ error: "Internal server error" });
  }
  });


  // Get resume by user ID
  router.get('/resumes/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const resume = await Resume.findOne({ userId });
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Endpoint to download resume
router.get('/resumes/download/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).send('Resume not found');
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${userId}-resume.pdf`);

    doc.pipe(res);

   // Add title
   doc.fontSize(25).text('Resume', { align: 'center' });
   doc.moveDown();

   // Add user photo
   if (resume.photo) {
     const photoPath = path.join(__dirname, '..', '', resume.photo); // Update path as needed
     doc.image(photoPath, { fit: [100, 100], align: 'left' });
     doc.moveDown();
   }

   // Add personal information
   doc.fontSize(16).text('Personal Information', { underline: true });
   doc.moveDown();
   doc.fontSize(12).text(`Full Name: ${resume.fullName}`);
   doc.text(`Qualification: ${resume.qualification}`);
   doc.text(`Experience: ${resume.experience}`);
   doc.text(`Personal Details: ${resume.personalDetails}`);
   doc.moveDown();

   // Add positions of responsibility
   if (resume.por) {
     doc.fontSize(16).text('Positions of Responsibility', { underline: true });
     doc.moveDown();
     doc.fontSize(12).text(resume.por);
     doc.moveDown();
   }

   // Add courses
   if (resume.courses) {
     doc.fontSize(16).text('Courses', { underline: true });
     doc.moveDown();
     doc.fontSize(12).text(resume.courses);
     doc.moveDown();
   }

   // Add projects
   if (resume.projects) {
     doc.fontSize(16).text('Projects', { underline: true });
     doc.moveDown();
     doc.fontSize(12).text(resume.projects);
     doc.moveDown();
   }

   // Add skills
   if (resume.skills) {
     doc.fontSize(16).text('Skills', { underline: true });
     doc.moveDown();
     doc.fontSize(12).text(resume.skills);
     doc.moveDown();
   }

   doc.end();
 } catch (error) {
   console.error('Error generating resume:', error);
   res.status(500).send('Error generating resume');
 }
});





module.exports = router;
