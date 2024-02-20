import axios from 'axios'
import wss from 'wss'
var key = ''

(async () => {
  const checkkeytrue = await axios.get("your server link/$key", (res,err) => {
    if(err) {
      console.log('wrong key, check ur server link may not correct or your key not eligible to login to the server!')
    } else {
      console.log(res.data)
    }
  })
})()
