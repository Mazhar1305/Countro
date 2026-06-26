import app from '../backend/src/app.js'
import ConnectDb from './src/configs/database.js';


ConnectDb()

app.listen(3000,()=>{
  console.log("server is running");
  
})