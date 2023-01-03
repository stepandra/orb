
import { DOSingleton } from '../../services/digitalocean/digitalocean_account' 

export default async function handler(req, res) {
  const { token } = req.body

  const doAccount = DOSingleton.getInstance('do_account', token, true)

  const droplets = await doAccount.listServers()
  
  res.send({ droplets })
}
