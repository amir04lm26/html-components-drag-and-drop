/// <reference path="BaseComponent.ts"/>
/// <reference path="ProjectItem.ts"/>
/// <reference path="../state/project.ts"/>
/// <reference path="../decorators/autoBind.ts"/>
/// <reference path="../models/project.ts"/>
/// <reference path="../models/dragAndDrop.ts"/>

namespace App {
  export class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    assignedProjects: Project[] = [];
    listId!: string;

    get listEl() {
      return this.element.querySelector(`#${this.listId}`)! as HTMLUListElement;
    }

    constructor(private type: ProjectStatus) {
      super("project-list", "app", "beforeend", `${type}-projects`);
      this.configure();
      this.renderContent();
    }

    @autoBind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer?.types[0] === "text/plain") {
        event.preventDefault(); // prevent dragLeaveHandler form happening - allow the dropHandler to happen
        const listEl = this.listEl;
        listEl.classList.add("droppable");
      }
    }

    @autoBind
    dragLeaveHandler(_event: DragEvent): void {
      const listEl = this.listEl;
      listEl.classList.remove("droppable");
    }

    @autoBind
    dropHandler(event: DragEvent): void {
      const dropElementId = event.dataTransfer!.getData("text/plain");
      projectState.moveProject(dropElementId, this.type);
    }

    configure() {
      this.listId = `${this.type}-project-list`;

      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);

      projectState.addListener((projects: Project[]) => {
        console.log("projects changed", projects, this.type);
        this.assignedProjects = projects.filter(
          (project) => project.projectStatus === this.type
        );
        this.renderProjects();
      });
    }

    renderContent() {
      this.element.querySelector("ul")!.id = this.listId;
      this.element.querySelector("h2")!.textContent =
        this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects() {
      const listEl = document.getElementById(this.listId) as HTMLUListElement;

      if (listEl) {
        listEl.innerHTML = "";
        for (const project of this.assignedProjects) {
          // const listItem = document.createElement("li");
          // listItem.textContent = project.title;
          // listEl.appendChild(listItem);
          new ProjectItem(this.listId, project);
        }
      }
    }
  }
}
