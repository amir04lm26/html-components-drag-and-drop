import { Component } from "../components/BaseComponent";
import { autoBind } from "../decorators/autoBind";
import { Project } from "../models/project";
import { Draggable } from "../models/dragAndDrop";

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  get people() {
    return this.project.people > 1
      ? `${this.project.people} people`
      : `${this.project.people} person`;
  }

  constructor(hostID: string, private project: Project) {
    super("single-project", hostID, "beforeend", project.id);

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent): void {
    (event.target as HTMLLIElement)?.classList.add("dragging");
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @autoBind
  dragEndHandler(event: DragEvent): void {
    (event.target as HTMLLIElement)?.classList.remove("dragging");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = `${this.people} assigned`;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
