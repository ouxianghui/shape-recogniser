//  Created by Jackie Ou on 02/09/2019.
//  Copyright © 2019 RingCentral. All rights reserved.

import { Box } from "./VxShape";

export class Vector {
    constructor(x: number = 0.0, y: number = 0.0, z: number = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public getX(): number {
        return this.x;
    }

    public setX(x: number) {
        this.x = x;
    }

    public getY(): number {
        return this.y;
    }

    public setY(y: number) {
        this.y = y;
    }

    public getZ(): number {
        return this.z;
    }

    public setZ(z: number) {
        this.z = z;
    }

    public isValid(): boolean {
        return Vector.isNormal(this.x) && Vector.isNormal(this.y) && Vector.isNormal(this.z);
    }

    public add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    public sub(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    public mul(s: number): Vector {
        return new Vector(this.x * s, this.y * s, this.z * s);
    }

    public div(s: number): Vector {
        return new Vector(this.x / s, this.y / s, this.z / s);
    }

    public move(offset: Vector): Vector {
        this.x += offset.x;
        this.y += offset.y;
        this.z += offset.z;
        return this;
    }

    public rotate(rotation: number): Vector {
        if (!this.isValid()) {
            return this;
        }
    
        const r: number = this.getMagnitude();
        const a: number = this.getAngle() + rotation;
    
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
    
        return this;
    }

    public rotate2(rotation: number, center: Vector): Vector {
        let v: Vector = this.sub(center);
        v.rotate(rotation);
        const r: Vector = center.add(v);
        this.x = r.x;
        this.y = r.y;
        this.z = r.z;
        return this;
    }

    public getRotated(rotation: number, center: Vector): Vector {
        let v: Vector = new Vector(this.x, this.y, this.z);
        v.rotate2(rotation, center);
        return v; 
    }

    public scale(factor: number, center: Vector): Vector {
        const v: Vector = new Vector(factor, factor, factor);
        return this.scale2(v, center);
    }

    public scale2(factors: Vector, center: Vector): Vector {
        const v: Vector = new Vector();
        if (center.equal(v)) {
            this.x *= factors.x;
            this.y *= factors.y;
            this.z *= factors.z;
            return this;
        }
        const s: Vector = this.sub(center);
        const x: Vector = s.scale2(factors, v);
        const r: Vector = center.add(x);
        this.x = r.x;
        this.y = r.y;
        this.z = r.z;
        return this;
    }

    public getScaled(factors: Vector, center: Vector): Vector {
        let v: Vector = new Vector(this.x, this.y, this.z);
        v.scale2(factors, center);
        return v;
    }

    public getDistanceTo(v: Vector): number {
        if (!this.isValid() || !v.isValid()) {
            return Number.NaN;
        } else {
            const r = this.sub(v);
            return r.getMagnitude();
        }
    }

    public getAngle(): number {
        let ret: number = 0.0;
        const m: number = this.getMagnitude();
    
        if (m > 1.0e-6) {
            const v2: Vector = new Vector(1.0, 0.0, 0.0);
            let dp = this.getDotProduct(v2);
            if (dp / m >= 1.0) {
                ret = 0.0;
            } else if (dp / m < -1.0) {
                ret = Math.PI;
            } else {
                ret = Math.acos(dp / m);
            }
            if (this.y < 0.0) {
                ret = 2*Math.PI - ret;
            }
        }
        return ret;
    }

    public getAngleTo(v: Vector): number {
        if (!this.isValid() || !v.isValid()) {
            return Number.NaN;
        } else {
            const r = this.sub(v);
            return r.getAngle();
        }
    }

    public getMagnitude(): number {
        if (!this.isValid()) {
            return Number.NaN;
        }
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public getDotProduct(v: Vector): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    public equal(v: Vector): boolean {
        if (this.isValid() == true && v.isValid() == true) {
            return this.x == v.x && this.y == v.y && this.z == v.z;
        } else if (this.isValid() == false && v.isValid() == false) {
            return true;
        }
        return false;
    }

    public isInside(b: Box): boolean {
        const bMin: Vector = b.getMinimum();
        const bMax: Vector = b.getMaximum();
    
        return (this.x >= bMin.x && this.x <= bMax.x && this.y >= bMin.y && this.y <= bMax.y && this.z
                >= bMin.z && this.z <= bMax.z);
    }

    /**
     * \ static methods here  
     */
    public static isNormal(val: number): boolean {
        if (isNaN(val) || !isFinite(val)) {
            return false;
        }
        return true;
    }

    public static getMinimum(v1: Vector, v2: Vector): Vector {
        return new Vector(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y), Math.min(v1.z, v2.z));
    }

    public static getMaximum(v1: Vector, v2: Vector): Vector {
        return new Vector(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y), Math.max(v1.z, v2.z));
    }

    private x: number;
    private y: number;
    private z: number;
}