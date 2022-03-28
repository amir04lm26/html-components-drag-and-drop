import { projectState } from "../state/project.js";
import { Project } from "../models/project.js";

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

export const storedProjects = ProjectStorage.initialize().getProjects();

console.log({storedProjects})
