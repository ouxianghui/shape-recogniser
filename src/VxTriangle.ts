//  Created by Jackie Ou on 02/09/2019.
//  Copyright © 2019 RingCentral. All rights reserved.

import { Vector } from "./VxVector";
import { ShapeType, Box, IShape } from "./VxShape";

export class Triangle implements IShape {
    constructor(c1: Vector, c2: Vector, c3: Vector) {
        this.corners.push(c1);
        this.corners.push(c2);
        this.corners.push(c3);
    }
    
    public shapeType(): ShapeType {
        return ShapeType.TRIANGLE;
    }

    public boundingBox(): Box {
        return new Box(Vector.getMinimum(Vector.getMinimum(this.corners[0], this.corners[1]),
        this.corners[2]), Vector.getMaximum(Vector.getMaximum(this.corners[0],
            this.corners[1]), this.corners[2]));
    }

    public move(offset: Vector): boolean {
        this.corners[0].move(offset);
        this.corners[1].move(offset);
        this.corners[2].move(offset);
        return true;
    }

    public rotate(rotation: number, center: Vector): boolean {
        this.corners[0].rotate2(rotation, center);
        this.corners[1].rotate2(rotation, center);
        this.corners[2].rotate2(rotation, center);
        return true;
    }

    public scale(scaleFactor: number, center: Vector): boolean {
        this.corners[0].scale(scaleFactor, center);
        this.corners[1].scale(scaleFactor, center);
        this.corners[2].scale(scaleFactor, center);
        return true;
    }

    public points(): Array<Vector> {
        return this.corners;
    }

    private corners: Array<Vector>;
}