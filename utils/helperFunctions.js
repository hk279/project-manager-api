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

const removeUserFromProject = (userId, project) => {
    /* Removes the deleted employee from task teams */
    const updatedTasks = project.tasks.map((task) => {
        if (task.assignedTo === userId) {
            return { ...task, assignedTo: "" };
        }
        return task;
    });

    /* Removes the deleted employee from project team */
    const updatedProjectTeam = project.team.filter((member) => member !== userId);

    const updatedProject = { ...project, team: updatedProjectTeam, tasks: updatedTasks };

    return updatedProject;
};

const removeInvalidUsersFromTasks = (project) => {
    const updatedTasks = project.tasks.map((task) => {
        if (!project.team.includes(task.assignedTo)) {
            return { ...task, assignedTo: "" };
        }
        return task;
    });

    return { ...project, tasks: updatedTasks };
};

const checkForEmptyResult = (data, res) => {
    if (data == null) {
        res.status(404).send({ messages: "Resource not found" });
    }
};

module.exports = {
    sortTasksByStatus,
    removeUserFromProject,
    removeInvalidUsersFromTasks,
    checkForEmptyResult,
};
