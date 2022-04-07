import { Location, MapStructure } from "../location";
import { generateAgent } from "./agentBuilder";

describe("Location should", () => {
    it("throw an error if wrong input", () => {
        expect(() => new Location(null)).toThrowError();
        expect(() => new Location("")).toThrowError();
        expect(() => new Location(" ")).toThrowError();
        expect(() => new Location("     ")).toThrowError();
    });

    it("create a valid instance", () => {
        let location = new Location("Anywhere");
        let connection = new Location("Connection");
        let agent = generateAgent("Agent");

        location.append([agent]);
        location.connectWith(connection);

        expect(location.agents.length).toBe(1);
        expect(location.agents[0].Name).toBe("Agent");
        expect(location.has(agent)).toBe(true);
        expect(location.connections.length).toBe(1);
        expect(location.connections[0].name).toBe("Connection");
        expect(location.isConnected(connection)).toBe(true);
    });
});

describe("MapStructure should", () => {
    it("throw an error if wrong input", () => {
        expect(() => new MapStructure(null)).toThrowError();
    });

    it("create a valid instance", () => {
        let location = new Location("Anywhere");
        let connection = new Location("Connection");

        Location.join(location, connection);

        let map = new MapStructure([ location, connection ]);

        let first = generateAgent("First");
        let second = generateAgent("Second");

        map.move(first, location);
        map.move(second, location);

        expect(map.getLocation("Anywhere").name).toBe("Anywhere");
        expect(map.getLocation("Connection").name).toBe("Connection");
        expect(map.getUbication(first).name).toBe("Anywhere");
        expect(map.getUbication(second).name).toBe("Anywhere");
        expect(map.areInTheSameLocation(first, second)).toBe(true);

        let moved = map.move(first, connection);

        expect(moved).toBe(true);
        expect(map.getUbication(first).name).toBe("Connection");
        expect(map.areInTheSameLocation(first, second)).toBe(false);

        let moveAgain = map.move(first, connection);
        expect(moveAgain).toBe(false);
    });
});