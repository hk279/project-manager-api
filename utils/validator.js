const isEmail = (val) => {
    const regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(val).toLowerCase());
};

// TODO: fix to allow scandinavian characters
const isValidName = (val) => {
    const regex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
    return regex.test(String(val).toLowerCase());
};

const isValidUserType = (val) => {
    return val === "admin" || val === "normal";
};

const isValidProjectType = (val) => {
    return val === "personal" || val === "internal" || val === "client";
};

const isValidWorkspaceType = (val) => {
    return val === "private" || val === "business";
};

module.exports = {
    isEmail,
    isValidName,
    isValidUserType,
    isValidProjectType,
    isValidWorkspaceType,
};
