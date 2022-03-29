import { IDGenerator } from "../utils/id";

export enum ProjectStatus {
  Active = "active",
  Finished = "finished",
}

// Project Type
export class Project {
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
