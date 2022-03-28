import { ProjectInput } from "./components/ProjectInput.js";
import { ProjectList } from "./components/ProjectList.js";
import { ProjectStatus } from "./models/project.js";

new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);
