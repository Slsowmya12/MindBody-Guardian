const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const auth = require('../checkauth.js');


const test = express.Router();
const getQuestions = express.Router();

test.get('/', auth, (req,res)=>{
  const testCategory = req.query.category;
  // console.log(testCategory);
  if(testCategory){
    res.status(302).sendFile(path.join(__dirname, '../public', 'test/test.html'));
  }else{
    res.status(400);
  }
})

getQuestions.get('/',auth, async (req,res)=>{
  const testCategory = req.query.category;
  console.log(testCategory);
  try{
    let data;
    if(testCategory==="depression"){
      const jsonData =await fs.readFile('./mlmodel/depression/depression_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }else if(testCategory==="stress"){
      const jsonData =await fs.readFile('./mlmodel/stress/stress_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }else if(testCategory==="anxiety"){
      const jsonData =await fs.readFile('./mlmodel/anxiety/anxiety_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }else if(testCategory==="autism"){
      const jsonData =await fs.readFile('./mlmodel/autism/autism_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }else if(testCategory==="dyslexia"){
      const jsonData =await fs.readFile('./mlmodel/dyslexia/dyslexia_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }else if(testCategory==="adhd"){
      const jsonData =await fs.readFile('./mlmodel/adhd/adhd_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }else if(testCategory==="ptsd"){
      const jsonData =await fs.readFile('./mlmodel/ptsd/ptsd_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }else if(testCategory==="general_test"){
      const jsonData = await fs.readFile('./mlmodel/general_test/general_test.json', 'utf-8');
      data = JSON.parse(jsonData);
    }
    else{
      return res.status(400).send({success:false, message:"Can't find test with the given category"})
    }
    return res.status(200).send({success:true, data:data});

  }catch(error){
    console.log("can't fetch json data", error);
  }
  
})

module.exports = {test, getQuestions}