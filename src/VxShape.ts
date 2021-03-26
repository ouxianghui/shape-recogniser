import { Vector } from "./VxVector";

export enum ShapeType {
    UNKNOWN = 0,
    LINE = 1,
    ARC = 2,
    CIRCLE = 3,
    TRIANGLE = 4,
    RECTANGLE = 5,
    ELLIPSE = 6,
    POLYLINE = 7,
    SPLINE = 8
}

export class Box {
    constructor(v1: Vector, v2: Vector) {
        this.lt.setX(v1.getX());
        this.lt.setY(v1.getY());
        this.lt.setZ(v1.getZ());
        this.rb.setX(v2.getX());
        this.rb.setY(v2.getY());
        this.rb.setZ(v2.getZ());
    }

    public setLt(lt: Vector) {
        this.lt = lt;
    }

    public getLt(): Vector {
        return this.lt;
    }

    public setRb(rb: Vector) {
        this.rb = rb;
    }

    public getRb(): Vector {
        return this.rb;
    }

    public getWidth(): number {
        return Math.abs(this.rb.getX() - this.lt.getX());
    }

    public getHeight(): number {
        return Math.abs(this.rb.getY() - this.lt.getY());
    }

    public getCenter(): Vector {
        return new Vector((this.lt.getX() + this.rb.getX()) / 2.0, (this.lt.getY() + this.rb.getY()) / 2.0, 0.0);
    }

    public isValid(): boolean {
        return (this.lt.isValid() && this.rb.isValid());
    }

    public getMinimum(): Vector {
       return Vector.getMinimum(this.lt, this.rb);
    }
   
    public getMaximum(): Vector {
       return Vector.getMaximum(this.lt, this.rb);
    }

    public contains(v: Vector): boolean {
        return v.isInside(this);
    }

    private lt: Vector;
    private rb: Vector;
}

export abstract class IShape {
    public abstract shapeType(): ShapeType;
    public abstract boundingBox(): Box;
    public abstract move(offset: Vector): boolean;
    public abstract rotate(rotation: number, center: Vector): boolean;
    public abstract scale(scaleFactor: number, center: Vector): boolean;
    public abstract points(): Array<Vector>;
}
