// Validation
interface IValidate {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active = "active",
  Finished = "finished",
}

interface IReceivedProject {
  title: string;
  description: string;
  numOfPeople: number;
}

type AddProjectParams = IReceivedProject | IReceivedProject[];
type Listener<T> = (items: T[]) => void;

// Project Type
class Project {
  id: string;

  constructor(
    public title: string,
    public description: string,
    public people: number,
    public projectStatus: ProjectStatus
  ) {
    this.id = IDGenerator.generate();
  }
}

function validate(validateObject: IValidate): boolean {
  const { value, required, minLength, maxLength, min, max } = validateObject;
  let isValid = true;

  if (required) {
    isValid = value.toString().trim().length !== 0;
  }
  if (typeof minLength === "number" && isValid && typeof value === "string") {
    isValid = value.length >= minLength;
  }
  if (typeof maxLength === "number" && isValid && typeof value === "string") {
    isValid = value.length <= maxLength;
  }
  if (typeof min === "number" && isValid && typeof value === "number") {
    isValid = value >= min;
  }
  if (typeof max === "number" && isValid && typeof value === "number") {
    isValid = value <= max;
  }

  return isValid;
}

function getType<T>(value: T) {
  const valueType = typeof value;
  const type = value
    ? Array.isArray(value)
      ? "array"
      : valueType === "object"
      ? "object"
      : typeof value
    : valueType;
  return type;
}

const DeepClone = {
  pickOperation<T>(item: T): T {
    const type = getType(item);
    switch (type) {
      case "array":
        return Array.isArray(item) ? this.cloneArray(item) : item;
      case "object":
        return this.cloneObject(item);
      default:
        return item;
    }
  },
  cloneArray<T extends T[]>(arr: T): T {
    const arrClone = new Array<T>(arr.length);
    for (const [index, item] of arr.entries()) {
      arrClone[index] = this.pickOperation(item);
    }
    return arrClone as T;
  },
  cloneObject<T extends Object>(obj: T): T {
    const newObj: Partial<T> = {};
    Object.assign(newObj, obj);
    for (const key in newObj) {
      if (Object.prototype.hasOwnProperty.call(newObj, key)) {
        const element = newObj[key];
        newObj[key] = this.pickOperation(element);
      }
    }
    return newObj as T;
  },
  clone<T extends Object | T[]>(obj: T): T {
    return this.pickOperation(obj);
  },
};

const IDGenerator = {
  base: 36,
  start: 2,
  end: 8,
  generate() {
    return (
      Math.random().toString(this.base).substring(this.start, this.end) +
      Date.now().toString(this.base).substring(this.start, this.end)
    );
  },
};

// auto-bind decorator
function autoBind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  // Adjusted Descriptor
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return adjDescriptor;
}

abstract class State<T> {
  protected _listeners: Listener<T>[] = [];
  protected _state: T[];

  constructor() {
    const self = this;
    let timeout: number;
    this._state = new Proxy([], {
      set: function (target: any, property, value, _receiver) {
        target[property] = value;

        //* Inform subscribers
        clearTimeout(timeout);
        // ? delay changes until the end of the current call stack
        timeout = setTimeout(() => {
          const projectsClone = DeepClone.clone(self._state);
          self.informListeners(projectsClone);
        }, 0);

        return true;
      },
    });
  }

  addListener(listenerFn: Listener<T>): void {
    this._listeners.push(listenerFn);
  }

  protected replaceState(index: number, newState: T) {
    this._state[index] = newState;
  }

  private informListeners(states: T[]) {
    for (const listenerFn of this._listeners) {
      listenerFn(states);
    }
  }
}

class ProjectState extends State<Project> {
  private static _instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance(): ProjectState {
    if (!this._instance) {
      this._instance = new ProjectState();
    }
    return this._instance;
  }

  setInitializeData(projects: Project[]) {
    for (const projectItem of projects) {
      this._state.push(projectItem);
    }
    return this._state;
  }

  addProject(projects: AddProjectParams) {
    const isArray = Array.isArray(projects);
    if (!isArray) return this.addProjectItem(projects);

    // ? if it is an array
    for (const projectItem of projects) {
      this.addProjectItem(projectItem);
    }
    return this._state;
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const prjIndex = this._state.findIndex(
      (project) => project.id === projectId
    );
    if (prjIndex > -1 && this._state[prjIndex].projectStatus !== newStatus) {
      const newProject = { ...this._state[prjIndex], projectStatus: newStatus };
      this.replaceState(prjIndex, newProject);
    }
  }

  private addProjectItem({
    title,
    description,
    numOfPeople,
  }: IReceivedProject) {
    const newProject = new Project(
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this._state.push(newProject);
    return this._state;
  }
}

const projectState = ProjectState.getInstance();

class ProjectStorage {
  private static storeID = "PROJECT_STORAGE";
  private static projects: Project[] = [];

  constructor() {}

  static initialize() {
    const storeData = localStorage.getItem(this.storeID);
    if (storeData) {
      try {
        this.projects = JSON.parse(storeData);
      } catch (error) {
        console.error(`There was an error parsing projects data: ${error}`);
      }
    }

    // * subscribe to project state changes
    projectState.addListener((projects: Project[]) => {
      this.saveProjects(projects);
    });

    return this;
  }

  static saveProjects(projects: Project[]) {
    localStorage.setItem(this.storeID, JSON.stringify(projects));
  }

  static getProjects() {
    return this.projects;
  }
}

const storedProjects = ProjectStorage.initialize().getProjects();
projectState.setInitializeData(storedProjects);

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  protected abstract configure(): void;
  protected abstract renderContent?(): void;

  constructor(
    templateId: string,
    hostElementId: string,
    insertPosition: InsertPosition,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId) as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) this.element.id = newElementId;

    this.attach(insertPosition);
  }

  private attach(insertPosition: InsertPosition) {
    this.hostElement.insertAdjacentElement(insertPosition, this.element);
  }
}

class ProjectItem
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

class ProjectList
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

class ProjectInput extends Component<HTMLElement, HTMLFormElement> {
  titleInputElement!: HTMLInputElement;
  descriptionInputElement!: HTMLTextAreaElement;
  peopleInputElement!: HTMLInputElement;

  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    this.configure();
  }

  protected configure() {
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLTextAreaElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    // this.formElement.addEventListener("submit", this.submitHandler.bind(this));
    this.element.addEventListener("submit", this.submitHandler);
  }

  protected renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = Number(this.peopleInputElement.value);

    // // Naive Validation
    // if (
    //   title.trim().length === 0 ||
    //   description.trim().length === 0 ||
    //   people <= 0 ||
    //   people > 10
    // )
    //   return;

    const titleValidation = {
      value: title,
      required: true,
    };
    const descriptionValidation = {
      value: description,
      required: true,
      minLength: 5,
    };
    const peopleValidation = {
      value: people,
      required: true,
      min: 1,
      max: 10,
    };
    if (
      !(
        validate(titleValidation) &&
        validate(descriptionValidation) &&
        validate(peopleValidation)
      )
    )
      return; // return 'undefined' if either of validations failed

    return [title, description, Number(people)];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      const [title, description, people] = userInput;
      projectState.addProject({ title, description, numOfPeople: people });
      this.clearInputs();
    }
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList(ProjectStatus.Active);
const finishedProjectList = new ProjectList(ProjectStatus.Finished);
