exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Healthy Server !!',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
