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
