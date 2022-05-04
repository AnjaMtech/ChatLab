const { log } = require('console');
const net = require('net');
const fs = require('fs');
const port = 9877;
const dataFile = 'chat.log'
let chatLog;

const server = net.createServer( (client)=>{
  console.log(`serverDel connected to client. Listening on port ${port}`)
  client.write(`clientDel connected to server. Listening on port ${port}`)
  chatLog = fs.readFileSync(dataFile, {encoding:'utf8', flag:'r'});

  fs.appendFile(dataFile, `Guest 000 connected\n`, (err)=>{
    if(err){
      throw err;
    }
  })


  client.on('data', (payload)=>{
    let clientMessage = payload.toString().trim()
    // console.log(`receiving ${clientMessage} from client`)

    client.write(`Guest 000: ${clientMessage}`)
    fs.appendFile(dataFile, `Guest 000: ${clientMessage}\n`, (err)=>{
      if(err){
        throw err;
      }
    })
    /*
      fs.appendFile(dataFile, `${currentFruit}, ${clientMessage}\n`, (err)=>{
        if(err){
          throw err;
        }
      })
      chatLog[currentFruit] = clientMessage

      currentFruit = undefined;
      client.write("---Enter another fruit")
    }else {
      if(chatLog[clientMessage] !== undefined){
        client.write(`---Color for ${clientMessage} is ${chatLog[clientMessage]}`)
      }else {
        currentFruit = clientMessage;
        client.write(`---I don't know the color for ${clientMessage}`)
        client.write(`---Please enter the color for ${clientMessage}`)
      }
      */
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
