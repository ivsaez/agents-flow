import { RolesDescriptor, Roles } from "../roles";
import { generateAgent } from "./agentBuilder";

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

describe("Roles should", () => {
    it("match roles", () => {
        let first = generateAgent("First");
        let second = generateAgent("Second");

        let roles = new Roles();
        roles.match("good", first);
        
        expect(roles.agents.length).toBe(1);
        expect(roles.agents[0].Name).toBe("First");
        expect(roles.roleNames.length).toBe(1);
        expect(roles.roleNames[0]).toBe("good");
        expect(roles.get("good").Name).toBe("First");
        expect(() => roles.get("bad")).toThrowError();
        expect(roles.matched(first)).toBe(true);
        expect(roles.matched(second)).toBe(false);
        expect(roles.has("good")).toBe(true);
        expect(roles.has("bad")).toBe(false);

        roles.match("bad", second);

        expect(roles.agents.length).toBe(2);
        expect(roles.agents[0].Name).toBe("First");
        expect(roles.agents[1].Name).toBe("Second");
        expect(roles.roleNames.length).toBe(2);
        expect(roles.roleNames[0]).toBe("good");
        expect(roles.roleNames[1]).toBe("bad");
        expect(roles.get("good").Name).toBe("First");
        expect(roles.get("bad").Name).toBe("Second");
        expect(roles.matched(first)).toBe(true);
        expect(roles.matched(second)).toBe(true);
        expect(roles.has("good")).toBe(true);
        expect(roles.has("bad")).toBe(true);
    });

    it("assign roles", () => {
        let first = generateAgent("First");
        let second = generateAgent("Second");

        let roles = new Roles();
        roles.match("good", first);
        roles.match("bad", second);

        let message = "[good]: Good morning [bad].";

        expect(roles.assignRoles(message)).toBe("First: Good morning Second.");
    });

    it("calculate equality", () =>{
        let first = generateAgent("First");
        let second = generateAgent("Second");

        let roles = new Roles();
        roles.match("good", first);
        roles.match("bad", second);

        let otherRoles = new Roles();
        otherRoles.match("good", first);

        expect(roles.equals(otherRoles)).toBe(false);

        otherRoles.match("bad", second);

        expect(roles.equals(otherRoles)).toBe(true);
    });

    it("generate string representation", () =>{
        let first = generateAgent("First");
        let second = generateAgent("Second");

        let roles = new Roles();
        roles.match("good", first);
        roles.match("bad", second);

        expect(roles.toString()).toBe("First as good,Second as bad");
    });
});