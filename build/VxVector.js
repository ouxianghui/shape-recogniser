//  Created by Jackie Ou on 02/09/2019.
//  Copyright © 2019 RingCentral. All rights reserved.

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Vector {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
    }
    getY() {
        return this.y;
    }
    setY(y) {
        this.y = y;
    }
    getZ() {
        return this.z;
    }
    setZ(z) {
        this.z = z;
    }
    isValid() {
        return Vector.isNormal(this.x) && Vector.isNormal(this.y) && Vector.isNormal(this.z);
    }
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul(s) {
        return new Vector(this.x * s, this.y * s, this.z * s);
    }
    div(s) {
        return new Vector(this.x / s, this.y / s, this.z / s);
    }
    move(offset) {
        this.x += offset.x;
        this.y += offset.y;
        this.z += offset.z;
        return this;
    }
    rotate(rotation) {
        if (!this.isValid()) {
            return this;
        }
        const r = this.getMagnitude();
        const a = this.getAngle() + rotation;
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        return this;
    }
    rotate2(rotation, center) {
        let v = this.sub(center);
        v.rotate(rotation);
        const r = center.add(v);
        this.x = r.x;
        this.y = r.y;
        this.z = r.z;
        return this;
    }
    getRotated(rotation, center) {
        let v = new Vector(this.x, this.y, this.z);
        v.rotate2(rotation, center);
        return v;
    }
    scale(factor, center) {
        const v = new Vector(factor, factor, factor);
        return this.scale2(v, center);
    }
    scale2(factors, center) {
        const v = new Vector();
        if (center.equal(v)) {
            this.x *= factors.x;
            this.y *= factors.y;
            this.z *= factors.z;
            return this;
        }
        const s = this.sub(center);
        const x = s.scale2(factors, v);
        const r = center.add(x);
        this.x = r.x;
        this.y = r.y;
        this.z = r.z;
        return this;
    }
    getScaled(factors, center) {
        let v = new Vector(this.x, this.y, this.z);
        v.scale2(factors, center);
        return v;
    }
    getDistanceTo(v) {
        if (!this.isValid() || !v.isValid()) {
            return Number.NaN;
        }
        else {
            const r = this.sub(v);
            return r.getMagnitude();
        }
    }
    getAngle() {
        let ret = 0.0;
        const m = this.getMagnitude();
        if (m > 1.0e-6) {
            const v2 = new Vector(1.0, 0.0, 0.0);
            let dp = this.getDotProduct(v2);
            if (dp / m >= 1.0) {
                ret = 0.0;
            }
            else if (dp / m < -1.0) {
                ret = Math.PI;
            }
            else {
                ret = Math.acos(dp / m);
            }
            if (this.y < 0.0) {
                ret = 2 * Math.PI - ret;
            }
        }
        return ret;
    }
    getAngleTo(v) {
        if (!this.isValid() || !v.isValid()) {
            return Number.NaN;
        }
        else {
            const r = this.sub(v);
            return r.getAngle();
        }
    }
    getMagnitude() {
        if (!this.isValid()) {
            return Number.NaN;
        }
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    getDotProduct(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    equal(v) {
        if (this.isValid() == true && v.isValid() == true) {
            return this.x == v.x && this.y == v.y && this.z == v.z;
        }
        else if (this.isValid() == false && v.isValid() == false) {
            return true;
        }
        return false;
    }
    isInside(b) {
        const bMin = b.getMinimum();
        const bMax = b.getMaximum();
        return (this.x >= bMin.x && this.x <= bMax.x && this.y >= bMin.y && this.y <= bMax.y && this.z
            >= bMin.z && this.z <= bMax.z);
    }
    /**
     * \ static methods here
     */
    static isNormal(val) {
        if (isNaN(val) || !isFinite(val)) {
            return false;
        }
        return true;
    }
    static getMinimum(v1, v2) {
        return new Vector(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y), Math.min(v1.z, v2.z));
    }
    static getMaximum(v1, v2) {
        return new Vector(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y), Math.max(v1.z, v2.z));
    }
}
exports.Vector = Vector;
//# sourceMappingURL=VxVector.js.map