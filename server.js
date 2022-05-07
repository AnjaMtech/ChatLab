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
    let commands = parseCommand(string);
    console.log(commands[0])
    if(commands[0] === "w"){
      client.write(`Whisper command incomplete`)
      client.write(`Will whisper to ${comands[1]}`)

    }else if(commands[0] === "username"){
      client.username = commands[1];
      client.write(`changed username to ${client.username}`)

    }else if(commands[0] === "kick"){
      client.write(`Kick command incomplete`)
      client.write(`Kicking ${commands[1]}`);

    }else if(commands[0] === "clientlist"){
      for(let i=0; i<users.length; i++){
        client.write(`-${users[i].username}`)
      }

    }else{
      client.write(`Command not recognized`)
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

function parseCommand(text){
  text = text.replaceAll("/", "")
  const output = text.split(/\r? /).filter(element => element);
  // console.log(output)
  return output;
}

parseCommand("l/ime green pine/apple yello/w")

server.listen(port, ()=>{
  // console.log(`server is up. listening on port ${port}`)
})
