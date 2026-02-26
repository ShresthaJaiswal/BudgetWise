// backend fetches the quote and returns it to the frontend. No CORS issue since it's server-to-server

import axios from 'axios'
import express from 'express'

const router = express.Router()

router.get('/quote', async (req, res) => {
  try {
    const response = await axios.get('https://zenquotes.io/api/random')
    const { q, a } = response.data[0]
    res.json({ text: q, author: a })
  } catch {
    // fallback if ZenQuotes is down
    res.json({
      text: 'A budget is telling your money where to go instead of wondering where it went.',
      author: 'Dave Ramsey'
    })
  }
})

export default router