const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const resultsModel = require('./mlModel/resultsModel');
const User = require('./userModel');
const auth = require('./checkauth.js');


const progress = express.Router();
const getProgress = express.Router();

progress.get('/', auth, async (req, res) => {
  if(req.session.category==="Student" ){
    return res.status(302).sendFile(path.join(__dirname, 'public', 'home/progress.html'));
  }else if(req.session.category==='Teacher'){
    return res.status(302).sendFile(path.join(__dirname, 'public', 'teacher/progress.html'));

  }
  else {
    res.status(400).send('Bad Request: please login to access');
  }
});


getProgress.get('/', auth, async (req, res) => {
  let progressEmail;
  let studentDetails;
  if(req.session.category==='Student'){
    progressEmail = req.session.userData.email;
  }
  else{
    progressEmail = req.query.student;
    try{
    await mongoose.connect("mongodb://localhost:27017/manashealth");
    studentDetails = await User.findOne({
      email: progressEmail,
    });
    }catch(err){
      console.error("couldnt find the user details", err);
    }
  }
  try {
    const studentProgress = await resultsModel.findOne({
      email: progressEmail,
    });
    if (studentProgress) {
      res.status(200).json({ success: true, progress: studentProgress.currentStatus, studentDetails, history:studentProgress.results});
    }else{
      res.status(404).json({success:false, message: "cannot find progress of the given student"});
    }
  } catch (error) {
    console.error("Error getting student progress:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = {
  progress, getProgress
}