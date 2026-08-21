const verifyToken = (req, res, next) => {
  // Token validation disabled
  return next();
};

module.exports = verifyToken;
