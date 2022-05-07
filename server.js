const { log } = require('console');
const net = require('net');
const fs = require('fs');
const port = 9877;
const dataFile = 'chat.log'
let chatLog;
let counter = 0;
const users = [];

const server = net.createServer( (client)=>{
  console.log(`serverDel connected to client. Listening on port ${port}`);
  client.write(`clientDel connected to server. Listening on port ${port}`);
  chatLog = fs.readFileSync(dataFile, {encoding:'utf8', flag:'r'});

  client.write(`\n`)
  client.username = `Guest${counter+1}`
  client.id = counter;


  //
  users[counter] = client;
  counter++;
  //

  function writeAll(message, type){
    let prefix ="";
    if(type === 'chat'){
      prefix = "[---";
    }
    for(let i=0; i<users.length; i++){
      users[i].write(`${prefix}${message}`)
    }
    saveLog(message)
  }
  function saveLog(string){
    fs.appendFile(dataFile, `${string}\n`, (err)=>{
      if(err){
        throw err;
      }
    })
  }
  function command(string){
    if(string === "/clientlist"){
      for(let i=0; i<users.length; i++){
        client.write(`-${users[i].username}`)

      }
    }
  }
  function removeUser(id){
    writeAll(`${client.username} disconnected`)
    users.splice(client.id, 1)
    counter--;
  }

  client.write(`You are connect under username ${client.username}\n`);
  writeAll(`${client.username} connected`);
  // saveLog(`${client.username} connected`)



  client.on('data', (payload)=>{
    let clientMessage = payload.toString().trim()
    if(clientMessage[0] !== '/'){
      writeAll(`${client.username}: ${clientMessage}`, "chat")
    }else{
      command(clientMessage);
    }
  })

  client.on('end', ()=>{
    removeUser();
  })
})

function parseText(text){
  let output = [];
  const tmp = text.split(/\r?\n/).filter(element => element);
  while(tmp.length){
    let words = tmp.shift();
    words = words.split(", ")
    output[words[0]] = words[1]
  }
  return output;
}

// parseText("lime, green\npineapple, yellow")

server.listen(port, ()=>{
  // console.log(`server is up. listening on port ${port}`)
})
