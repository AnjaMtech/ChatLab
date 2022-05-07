const net = require('net');
const port = 9877;

const client = net.createConnection( {port: port}, ()=>{
  // client.write("this")
  // console.log(`connected to server \n`)
})

process.stdin.setEncoding('utf-8')
process.stdin.on('readable', ()=>{
  let userInput;
  // console.log(`I don't know the color for ${userInput}`)
  while( (userInput = process.stdin.read()) !== null){
    client.write(userInput)
  }
})

client.on('data', (message)=>{
  console.log(`${message}`)
})
