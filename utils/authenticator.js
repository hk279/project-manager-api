module.exports = (req, res, next) => {
    console.log(req.cookies);
    console.log(req.signedCookies);
    next();
};
