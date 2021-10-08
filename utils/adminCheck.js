module.exports = (req) => {
    if (req.user.userType === "admin") {
        return true;
    } else {
        return false;
    }
};
