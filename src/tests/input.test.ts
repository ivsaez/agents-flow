import { Input } from "../input";

describe("Input should", () => {
    it("create an input index", () => {
        let input = new Input(3);

        expect(input.choiceIndex).toBe(3);
        expect(input.isVoid).toBe(false);
    });

    it("create a void input", () => {
        let input = Input.void();

        expect(input.isVoid).toBe(true);
    });
});