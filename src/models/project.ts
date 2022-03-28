namespace App {
  export enum ProjectStatus {
    Active = "active",
    Finished = "finished",
  }

  export const IDGenerator = {
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
}
