/// <reference path="BaseComponent.ts"/>
/// <reference path="../state/project.ts"/>
/// <reference path="../decorators/autoBind.ts"/>
/// <reference path="../utils/validation.ts"/>

namespace App {
  export class ProjectInput extends Component<HTMLElement, HTMLFormElement> {
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
}
