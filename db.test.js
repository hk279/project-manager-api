require("./mongo");
const Project = require("./models/project");
const Employee = require("./models/employee");

const helper = require("./utils/helperFunctions");

test("Test for non-existing employee IDs in project teams or task teams", async () => {
    const employees = await Employee.find({});
    const employeeIds = employees.map((emp) => emp.id);

    const projects = await Project.find({});
    let employeeIdsInProjects = [];

    projects.forEach((project) => {
        employeeIdsInProjects.concat(project.team);
        project.tasks.forEach((task) => {
            employeeIdsInProjects.concat(task.team);
        });
    });

    /* Cheks if there are invalid employee IDs in project teams or tasks */
    const nonExistingIdsFound = (ids, idsInProjects) => {
        idsInProjects.forEach((id) => {
            if (!ids.includes(id)) {
                return true;
            }
        });

        return false;
    };

    expect(nonExistingIdsFound(employeeIds, employeeIdsInProjects)).toBe(false);
});
