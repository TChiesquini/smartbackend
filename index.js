//global.__dir = __dirname;

import fetch from "node-fetch";
import { readFile } from 'fs/promises';
import express from "express";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { ObjectId, ConnectionReadyEvent } from 'mongodb';

import Message from './model/messaging.js';
import FullAlarm from './model/fullalarm.js';

const app = express();
const serviceAccount = JSON.parse(
  await readFile(
    new URL('./chave.json', import.meta.url)
  )
);
import { google } from 'googleapis';

//router.use(require('cors')())
app.use(express.static("src"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.listen(3003,function(erro){
    if(erro){
        console.log("Ocorreu um erro!")
    }else{
        console.log("Servidor iniciado com sucesso!")
    }
})

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const SCOPES = [MESSAGING_SCOPE];

function getAccessToken() {
return new Promise(function(resolve, reject) {
    const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    SCOPES,
    null
    );
    jwtClient.authorize(function(err, tokens) {
    if (err) {
        reject(err);
        return;
    }
    resolve(tokens.access_token);
    });
});
}

const sendMessage = async (message) => {
    
    const accessToken = await getAccessToken();
    const response = await fetch('https://fcm.googleapis.com/v1/projects/smartmonitor-bfd1a/messages:send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    return data;
  };

app.get('/sendmessage/:title/:body', async function(req,res,next){

  var formatter = new Intl.DateTimeFormat('pt-BR');
  var date = new Date();

  const resposta = await sendMessage(
    {
        "message": {
          "topic": "smartAlerta",
          "notification": {
            "title": req.params.title,
            "body": req.params.body
          },
          "android": {
            "notification": {       
              "default_sound": true,
              "default_vibrate_timings": true,
              "default_light_settings": true
            },
            "priority": "high"
          },
          "apns": {
            "payload": {
              "aps": {
                "category": "NEW_MESSAGE_CATEGORY"
              }
            }
          }
        }
    }
);

  const message = await Message.create({
    datain: formatter.format(date), 
    horain: new Date().toLocaleTimeString(),
    titulo: req.params.title,
    corpo: req.params.body
  });

  console.log(message);

  if(resposta.name){
    res.status(200).send('Mensagem enviada com sucesso!! '+resposta.name)
  }else{
    res.status(400).send(resposta)
  }

});

app.get('/message', async function(req,res,next){

  try{
      res.status(200).json(await Message.find().sort({'createdAt': -1}));
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
  
});

app.put('/message/:id', async function(req,res,next){

  let id  = {_id:new mongoose.Types.ObjectId(req.params.id)};

  try{
    const dados = req.body;
    res.status(200).json(await Message.updateOne({ "_id" : id },{$set: dados}));
  }catch{
    res.status(400).json({erro:`${ex}`});
  }

})

app.post('/fullalarm', async function(req,res,next){

  try{
      res.status(200).json(await FullAlarm.create(req.body));
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
  
});

app.put('/fullalarm/:usuario', async function(req,res,next){

  try{
      res.status(200).json(await FullAlarm.updateOne({"usuario": req.params.usuario},{$set: req.body}));
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
  
});

app.get('/fullalarm/:id', async function(req,res,next){

  try{
      res.status(200).json(await FullAlarm.findOne({"usuario": req.params.id}));
  }
  catch(ex){
      res.status(400).json({erro:`${ex}`});
  }
  
});
