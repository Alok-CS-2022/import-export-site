export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({ 
    status: 'working',
    message: 'API routing is functional',
    timestamp: new Date().toISOString()
  });
}
