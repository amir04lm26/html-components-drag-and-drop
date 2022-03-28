export function getType<T>(value: T) {
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

export const DeepClone = {
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
