import { ProjectInput } from "./components/ProjectInput";
import { ProjectList } from "./components/ProjectList";
import { ProjectStatus } from "./models/project";

import "./app.css";

new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);
