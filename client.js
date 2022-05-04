const net = require('net');
const port = 9877;

const client = net.createConnection( {port: port}, ()=>{
  // client.write("this")
  // console.log(`connected to server \n`)
  // console.log(`Enter a fruit name and I will see if I know the color for it. \n`)
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
