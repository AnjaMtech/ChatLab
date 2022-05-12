const { log } = require('console');
const net = require('net');
const fs = require('fs');
const port = 9877;
const dataFile = 'chat.log'
let chatLog;
let counter = 0;
const users = [];
const password = "BlackCat";

const server = net.createServer( (client)=>{
  client.write(`\n`)
  client.username = `Guest${counter+1}`
  client.id = counter;
  chatLog = fs.readFileSync(dataFile, {encoding:'utf8', flag:'r'});
  users[users.length] = client;
  counter++;
  //After setup
  console.log(`${client.username} connected to client. Listening on port ${port}`);
  // client.write(`Connected to the server under username ${client.username}, listening on port ${port}`);
  tellUser(`Connected to the server under username ${client.username}, listening on port ${port}`);
  tellOthers(`${client.username} has joined`)
  saveLog(`${client.username} joined`)

  function tellUser(message){
    client.write(`${message}\n`)
  }
  function tellOthers(message){
    for(let i=0; i<users.length; i++){
      if(users[i].username !== client.username){
        users[i].write(`---{${message}}---`);
      }
    }
  }
  function tellOne(index, message){
    if(users[index] !== undefined){
      users[index].write(`---{${message}}---`)
    }else{
      tellUser(`Error`)
      console.log(`Cannot find user`)
    }
  }
  function announce(message){
    prefix = "---{";
    suffix = "}---";
    for(let i=0; i<users.length; i++){
      users[i].write(`${prefix}${message}${suffix}`);
    }
    saveLog(`${message}`);
  }
  function chat(message){
    for(let i=0; i<users.length; i++){
      if(users[i].username !== client.username){
        users[i].write(`[${client.username}]---${message}`);
        saveLog(`${client.username}: ${message}`);
      }
    }
  }
  function whisper(recipient, message){
    console.log(`whisper to ${recipient}`)
    let i = getUserIndex(recipient)
    if(i !== null){
      users[i].write(`~${client.username} w -> ${recipient}: ${message}`)
    }else{
      tellUser(`Sorry there is no ${recipient} connected at the moment`)
    }
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
    if(commands[0] === "w"){
      let index = getUserIndex(commands[1]);
      if(commands[1] === client.username){
        tellUser(`You cannot whisper to yourself.`)
      }else{
        let message = "";
        for(let i=2; i<commands.length; i++){
          message += `${commands[i]} `
        }
        if(index !== null){
          whisper(commands[1], message)
          tellUser(`You whispered ${message} to ${commands[1]}`)
          saveLog(`${client.username} whispered ${message} to ${commands[1]}`)
        }

      }
    }else if(commands[0] === "username"){
      if(commands.length === 1){
        tellUser(`Your username is ${client.username}`);
      }else if(commands.length === 2){
        if(commands[1] === client.username){
          tellUser(`Your username is already ${commands[1]}`);
        }else{
          tellOthers(`${client.username} changed name to ${commands[1]}`);
          saveLog(`${client.username} changed name to ${commands[1]}`)
          client.username = commands[1];
          tellUser(`Successfully changed username to ${client.username}`);
        }
      }else{
        tellUser(`You have too many inputs. Either say /username to see your username or /username {name} to change it.`)
      }



    }else if(commands[0] === "kick"){
      //-----WIP-----
      i = getUserIndex(commands[1])
      if(commands.length < 2){
        tellUser(`You need to input a username`)
      }else if(i === null){
        tellUser(`That user does not exist`)
      }else if(client.username === commands[1]){
        tellUser(`You cannot kick yourself`)
      }else if(commands.length !== 3){
        tellUser(`There should be 3 inputs not ${commands.length}. Correct command is /kick {username} {password}`)
      }else if(commands[2] !== password){
        tellUser(`That is the wrong password`)
      }else{
        tellUser(`Successfully kicked ${commands[1]}`)
        tellOthers(`${commands[1]} has been kicked`)
        tellOne(i, `You have been kicked`);
        users[i].destroy();
        saveLog(`${commands[1]} was kicked`)
      }

      /*
      if(i !== null && commands[1] !== client.username){
        if(commands[2] === password){
          tellUser(`Successfully kicked ${commands[1]}`)
          tellOne(i, `You have been kicked`)
          users[i].destroy();
        }else if(commands.length !== 3){
          tellUser(`There are not enough inputs. Correct command is /kick {username} {password}`)
        }else{
          tellUser(`Password is incorrect`)

        }

      }else if(i === null){
        tellUser(`There is no user named ${commands[1]}.`)
      }else{
        tellUser(`You cannot kick yourself.`)
      }
      */
      //-----WIP-----


    }else if(commands[0] === "clientlist"){
      for(let i=0; i<users.length; i++){
        client.write(`-${users[i].username}`)
      }

    }else{
      client.write(`Command not recognized`)
    }
  }
  function removeUser(id){
    tellOthers(`${client.username} disconnected`)
    users.splice(client.id, 1)
    // counter--;
  }
  function getUserIndex(username){
    let output = null;
    for(let i=0; i<users.length; i++){
      if(users[i].username === username){
        console.log("user exists")
        output = i;
      }
    }
    if(output === null){
      tellUser(`Sorry that user does not exist`)
    }
    return output;
  }
  // saveLog(`${client.username} connected`)

  client.on('data', (payload)=>{
    let clientMessage = payload.toString().trim()
    if(clientMessage[0] !== '/'){
      chat(clientMessage);
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

server.listen(port, ()=>{
  // console.log(`server is up. listening on port ${port}`)
})
