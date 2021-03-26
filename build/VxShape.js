//  Created by Jackie Ou on 02/09/2019.
//  Copyright © 2019 RingCentral. All rights reserved.

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VxVector_1 = require("./VxVector");
var ShapeType;
(function (ShapeType) {
    ShapeType[ShapeType["UNKNOWN"] = 0] = "UNKNOWN";
    ShapeType[ShapeType["LINE"] = 1] = "LINE";
    ShapeType[ShapeType["ARC"] = 2] = "ARC";
    ShapeType[ShapeType["CIRCLE"] = 3] = "CIRCLE";
    ShapeType[ShapeType["TRIANGLE"] = 4] = "TRIANGLE";
    ShapeType[ShapeType["RECTANGLE"] = 5] = "RECTANGLE";
    ShapeType[ShapeType["ELLIPSE"] = 6] = "ELLIPSE";
    ShapeType[ShapeType["POLYLINE"] = 7] = "POLYLINE";
    ShapeType[ShapeType["SPLINE"] = 8] = "SPLINE";
})(ShapeType = exports.ShapeType || (exports.ShapeType = {}));
class Box {
    constructor(v1, v2) {
        this.lt.setX(v1.getX());
        this.lt.setY(v1.getY());
        this.lt.setZ(v1.getZ());
        this.rb.setX(v2.getX());
        this.rb.setY(v2.getY());
        this.rb.setZ(v2.getZ());
    }
    setLt(lt) {
        this.lt = lt;
    }
    getLt() {
        return this.lt;
    }
    setRb(rb) {
        this.rb = rb;
    }
    getRb() {
        return this.rb;
    }
    getWidth() {
        return Math.abs(this.rb.getX() - this.lt.getX());
    }
    getHeight() {
        return Math.abs(this.rb.getY() - this.lt.getY());
    }
    getCenter() {
        return new VxVector_1.Vector((this.lt.getX() + this.rb.getX()) / 2.0, (this.lt.getY() + this.rb.getY()) / 2.0, 0.0);
    }
    isValid() {
        return (this.lt.isValid() && this.rb.isValid());
    }
    getMinimum() {
        return VxVector_1.Vector.getMinimum(this.lt, this.rb);
    }
    getMaximum() {
        return VxVector_1.Vector.getMaximum(this.lt, this.rb);
    }
    contains(v) {
        return v.isInside(this);
    }
}
exports.Box = Box;
class IShape {
}
exports.IShape = IShape;
//# sourceMappingURL=VxShape.js.map