import { Roles } from "../roles";
import { Deliverer } from "../interaction";
import { Phrase } from "../phrase";

describe("Deliverer should", () => {
    it("throw error if wrong input.", () => {
        expect(() => new Deliverer(null)).toThrowError();
    });

    it("Deliver phrases", () => {
        let phrase1 = new Phrase("performer", "target");
        let phrase2 = new Phrase("first", "second");

        let deliverer = new Deliverer([ phrase1, phrase2 ]);

        expect(deliverer.isFinished).toBe(false);

        let firstDelivery = deliverer.deliver(new Roles());
        let secondDelivery = deliverer.deliver(new Roles());

        expect(firstDelivery.performerRole).toBe("performer");
        expect(firstDelivery.targetRole).toBe("target");
        expect(secondDelivery.performerRole).toBe("first");
        expect(secondDelivery.targetRole).toBe("second");
        expect(deliverer.isFinished).toBe(true);
        expect(() => deliverer.deliver(new Roles())).toThrowError();
    });
});