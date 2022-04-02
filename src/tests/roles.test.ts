import { RolesDescriptor } from "../roles";

describe("Roles descriptor should", () => {
    it("create a valid descriptor without secondarys", () => {
        let descriptor = new RolesDescriptor("main");

        expect(descriptor.main).toBe("main");
        expect(descriptor.secondarys.length).toBe(0);
        expect(descriptor.all.length).toBe(1);
        expect(descriptor.all[0]).toBe("main");
    });

    it("create a valid descriptor", () => {
        let descriptor = new RolesDescriptor("main", ["first", "second"]);

        expect(descriptor.main).toBe("main");
        expect(descriptor.secondarys.length).toBe(2);
        expect(descriptor.secondarys[0]).toBe("first");
        expect(descriptor.secondarys[1]).toBe("second");
        expect(descriptor.all.length).toBe(3);
        expect(descriptor.all[0]).toBe("main");
        expect(descriptor.all[1]).toBe("first");
        expect(descriptor.all[2]).toBe("second");
    });

    it("throw error when wrong input", () => {
        expect(() => new RolesDescriptor(null)).toThrowError();
        expect(() => new RolesDescriptor("")).toThrowError();
        expect(() => new RolesDescriptor(" ")).toThrowError();
        expect(() => new RolesDescriptor("main", null)).toThrowError();
    });
});