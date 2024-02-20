import axios from 'axios'
import fs from 'fs'
const __dirname = dirname(fileURLToPath(import.meta.url));

var version = fs.readStream(__dirname('package.json'))

async function checkforupdate() {
  var globalpackage = await axios.get('https://raw.githubusercontent.com/fngdng/alphabet/main/package.json')
  var globalversion = globalpackage.version
  if(version != globalversion) {
    console.log("ur bot version is not sync to global version, you may using outdated version or beta version, if u r using outdated version, please update to use latest perform of out works!")
  }
}
