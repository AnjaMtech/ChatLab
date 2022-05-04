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


  //
  users[counter] = client;
  counter++;
  //

  function writeAll(message){
    for(let i=0; i<users.length; i++){
      users[i].write(`${message}`)
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

  writeAll(`${client.username} connected`)
  // saveLog(`${client.username} connected`)

  client.write(`You are connect under username ${client.username}\n`)







  client.on('data', (payload)=>{
    let clientMessage = payload.toString().trim()
    // console.log(`receiving ${clientMessage} from client`)
    writeAll(`${client.username}: ${clientMessage}`)
  })
  client.on('end', ()=>{
    writeAll(`${client.username} disconnected`)
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

  // console.log(`---] PARSED DATA is`)
  // console.log(output)
  return output;
}

// parseText("lime, green\npineapple, yellow")

server.listen(port, ()=>{
  // console.log(`server is up. listening on port ${port}`)
})
