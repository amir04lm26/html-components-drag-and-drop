// import { DeepClone } from "../utils/clone.js";
// Or
import * as Clone from "../utils/clone";
import { Project, ProjectStatus } from "../models/project";

interface IReceivedProject {
  title: string;
  description: string;
  numOfPeople: number;
}

type AddProjectParams = IReceivedProject | IReceivedProject[];
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected _listeners: Listener<T>[] = [];
  protected _state: T[];

  constructor() {
    const self = this;
    let timeout: NodeJS.Timeout;
    this._state = new Proxy([], {
      set: function (target: any, property, value, _receiver) {
        target[property] = value;

        //* Inform subscribers
        clearTimeout(timeout);
        // ? delay changes until the end of the current call stack
        timeout = setTimeout(() => {
          const projectsClone = Clone.DeepClone.clone(self._state);
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
      const newProject = {
        ...this._state[prjIndex],
        projectStatus: newStatus,
      };
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

export const projectState = ProjectState.getInstance();
