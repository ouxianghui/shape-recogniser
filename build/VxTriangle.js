"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VxVector_1 = require("./VxVector");
const VxShape_1 = require("./VxShape");
class Triangle {
    constructor(c1, c2, c3) {
        this.corners.push(c1);
        this.corners.push(c2);
        this.corners.push(c3);
    }
    shapeType() {
        return VxShape_1.ShapeType.TRIANGLE;
    }
    boundingBox() {
        return new VxShape_1.Box(VxVector_1.Vector.getMinimum(VxVector_1.Vector.getMinimum(this.corners[0], this.corners[1]), this.corners[2]), VxVector_1.Vector.getMaximum(VxVector_1.Vector.getMaximum(this.corners[0], this.corners[1]), this.corners[2]));
    }
    move(offset) {
        this.corners[0].move(offset);
        this.corners[1].move(offset);
        this.corners[2].move(offset);
        return true;
    }
    rotate(rotation, center) {
        this.corners[0].rotate2(rotation, center);
        this.corners[1].rotate2(rotation, center);
        this.corners[2].rotate2(rotation, center);
        return true;
    }
    scale(scaleFactor, center) {
        this.corners[0].scale(scaleFactor, center);
        this.corners[1].scale(scaleFactor, center);
        this.corners[2].scale(scaleFactor, center);
        return true;
    }
    points() {
        return this.corners;
    }
}
exports.Triangle = Triangle;
//# sourceMappingURL=VxTriangle.js.map