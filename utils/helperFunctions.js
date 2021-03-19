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

const removeEmployeeFromProject = (employeeId, project) => {
    /* Removes the deleted employee from task teams */
    const updatedTasks = project.tasks.map((task) => {
        const newTeam = task.taskTeam.filter((member) => member !== employeeId);
        return { ...task, taskTeam: newTeam };
    });

    /* Removes the delete employee from project team */
    const updatedProjectTeam = project.team.filter((member) => member !== employeeId);

    const updatedProject = { ...project, team: updatedProjectTeam, tasks: updatedTasks };

    return updatedProject;
};

module.exports = {
    sortTasksByStatus,
    removeEmployeeFromProject,
};
