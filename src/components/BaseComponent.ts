export const something = "...";

export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

export default Component;
