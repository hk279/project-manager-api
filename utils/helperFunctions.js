const sortTasksByStatus = (tasks) => {
    return tasks.sort((a, b) => {
        var x = a.status.toLowerCase();
        var y = b.status.toLowerCase();
        if (x < y) {
            return 1;
        }
        if (x > y) {
            return -1;
        }
        return 0;
    });
};

module.exports = {
    sortTasksByStatus,
};
