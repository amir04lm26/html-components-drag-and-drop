/// <reference path="models/project.ts"/>
/// <reference path="components/ProjectList.ts"/>
/// <reference path="components/ProjectInput.ts"/>

namespace App {
  new ProjectInput();
  new ProjectList(ProjectStatus.Active);
  new ProjectList(ProjectStatus.Finished);
}
