import hello from "..";

describe("it should say hello", () => {
  it("should greet 'Ivan'", () => {
    expect(hello()).toBe("Hello, Ivan");
  });

  it("should greet 'Daniel'", () => {
    expect(hello("Daniel")).toBe("Hello, Daniel");
  });
});