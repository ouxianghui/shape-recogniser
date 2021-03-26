import { func } from 'prop-types';

//  Created by Jackie Ou on 02/09/2019.
//  Copyright © 2019 RingCentral. All rights reserved.

const cv = require('./opencv');

function areaOfTriangle(pa, pb, pc) {
    let posTerm = (pa.x * pb.y) + (pa.y * pc.x) + (pb.x * pc.y);
    let negTerm = (pb.y * pc.x) + (pa.x * pc.y) + (pa.y * pb.x);
    let determinant = posTerm - negTerm;
    return Math.abs(determinant) / 2;
}

function triangleCentroid(pa, pb, pc) {
    return new cv.Point((pa.x + pb.x + pc.x)/3, (pa.y + pb.y + pc.y)/3);
}

function largestTriangleArea(points) {
    let value = -1;
    let sz = points.length;
    for (let i = 0; i < sz; ++i) {
        for (let j = i + 1; j < sz; ++j) {
            for (let k = j + 1; k < sz; ++k) {
                value = Math.max(value, areaOfTriangle(points[i], points[j], points[k]));
            }
        }
    }
    return value;
}

function pointsArrayFromMat32S(mat) {
    console.log("mat.data32S = ", mat.data32S);
    let points = new Array();
    for (let r = 0, i = 0; r < mat.data32S.length; r += 2, ++i) {
        let pt = new cv.Point();
        pt.x = mat.data32S[r];
        pt.y = mat.data32S[r + 1];
        points[i] = pt;
        console.log("points[i].x = ", points[i].x, ", points[i].y = ", points[i].y);
    }
    return points;
}

function p2pDistance(pt1, pt2) 
{
    return Math.sqrt((pt1.x - pt2.x)*(pt1.x - pt2.x) + (pt1.y - pt2.y)*(pt1.y - pt2.y));
}

function isNormal(v) {
    if (isNaN(v) || !isFinite(v)) {
        return false;
    }
    return true;
}

function isVectorNormal(v) {
    return isNormal(v.x) && isNormal(v.y) && isNormal(v.z);
}

function getDotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function getMagnitude2D(v) {
    let valid = isNormal(v.x) && isNormal(v.y) && isNormal(v.z);
    if (!valid) {
        return Number.NaN;
    }
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

function vectorSub(v1, v2) {
    let v = {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };

    return v;
}

function getAngle(v) {
    let ret = 0.0;
    let m = getMagnitude2D(v);

    if (m > 1.0e-6) {
        let v2 = {};
        v2.x = 1.0;
        v2.y = 0.0;
        v2.z = 0.0;
        let dp = getDotProduct(v, v2);
        if (dp / m >= 1.0) {
            ret = 0.0;
        } else if (dp / m < -1.0) {
            ret = Math.PI;
        } else {
            ret = Math.acos(dp / m);
        }
        if (v.y < 0.0) {
            ret = 2*Math.PI - ret;
        }
    }
    return ret;
}

function getAngleTo(v1, v2) {
    let validV1 = isVectorNormal(v1);
    let validV2 = isVectorNormal(v2);
    if (!validV1 || !validV2) {
        return Number.NaN;
    } else {
        let r = vectorSub(v2, v1);
        return getAngle(r);
    }
}

function bsplineInterpolate(t, degree, points, knots, weights, result) {
    let i, j, s, l;           // function-scoped iteration variables
    let n = points.length;    // points count
    let d = points[0].length; // point dimensionality
  
    if (degree < 1) {
        console.log('degree must be at least 1 (linear)');
        return;
    }
    if (degree > (n - 1)) {
        console.log('degree must be less than or equal to point count - 1');
        return;
    }
  
    if (!weights) {
        // build weight vector of length [n]
        weights = [];
        for (i = 0; i < n; i++) {
            weights[i] = 1;
        }
    }
  
    if (!knots) {
        // build knot vector of length [n + degree + 1]
        var knots = [];
        for (i = 0; i < n + degree + 1; i++) {
            knots[i] = i;
        }
    } else {
        if (knots.length !== (n + degree + 1)) {
            console.log('bad knot vector length');
            return;
        }
    }
  
    let domain = [
        degree,
        knots.length - 1 - degree
    ];
  
    // remap t to the domain where the spline is defined
    let low  = knots[domain[0]];
    let high = knots[domain[1]];
    t = t * (high - low) + low;
  
    if (t < low || t > high) {
        console.log('out of bounds');
        return;
    }
  
    // find s (the spline segment) for the [t] value provided
    for (s = domain[0]; s < domain[1]; s++) {
        if (t >= knots[s] && t <= knots[s + 1]) {
            break;
        }
    }
  
    // convert points to homogeneous coordinates
    let v = [];
    for (i = 0; i < n; i++) {
        v[i] = [];
        for (j = 0; j < d; j++) {
            v[i][j] = points[i][j] * weights[i];
        }
        v[i][d] = weights[i];
    }
  
    // l (level) goes from 1 to the curve degree + 1
    let alpha;
    for (l = 1; l <= degree + 1; l++) {
        // build level l of the pyramid
        for (i = s; i > s - degree - 1 + l; i--) {
            alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i]);
  
            // interpolate each component
            for (j = 0; j < d + 1; j++) {
                v[i][j] = (1 - alpha) * v[i-1][j] + alpha * v[i][j];
            }
        }
    }
  
    // convert back to cartesian and return
    var result = result || [];
    for ( i = 0; i < d; i++) {
        result[i] = v[s][i] / v[s][d];
    }
  
    return result;
}
  

function guessLine(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 2) {
        return false;
    }
    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);

    let pch = cv.arcLength(output, true);
    let pch2 = pch * pch;
    
    let ach = cv.contourArea(output, false);

    output.delete();

    let ratio = pch2 / ach;

    console.log("pch2 = ", pch2);
    console.log("ach = ", ach);
    console.log("pch2/ach = ", ratio);

    let isLine = false;
    if (ratio >= 106) {
        isLine = true;
    }

    let pointsArr = new Array();
    if (isLine) {
        let arr = pointsArrayFromMat32S(pts);
        let pt1 = arr[0];
        let pt2 = arr[arr.length - 1];
        let v1 = {
            x: pt1.x,
            y: pt1.y,
            z: 0
        };
        let v2 = {
            x: pt2.x,
            y: pt2.y,
            z: 0
        };
        let rad = getAngleTo(v1, v2);
        let degree = rad * 180/Math.PI;
        console.log(" line angle = ", degree);
        const TOLERANCE = 10.0;
        if ((degree >= (90.0-TOLERANCE) && degree <= (90.0+TOLERANCE)) || (degree >= (270.0-TOLERANCE) && degree <= (270.0+TOLERANCE))) {
            // vertical
            let midPoint = {
                x: (pt1.x + pt2.x)/2.0,
                y: (pt1.y + pt2.y)/2.0
            };
            let len = p2pDistance(pt1, pt2)/2.0;
            pt1.x = midPoint.x;
            pt2.x = midPoint.x;
            if (pt1.y > midPoint.y) {
                pt1.y = midPoint.y + len;
                pt2.y = midPoint.y - len;
            } else {
                pt1.y = midPoint.y - len;
                pt2.y = midPoint.y + len;
            }
        } else if ((degree <= TOLERANCE || degree >= (360.0-TOLERANCE)) || (degree >= (180.0-TOLERANCE) && degree <= (180.0+TOLERANCE))) {
            // Horizontal
            let midPoint = {
                x: (pt1.x + pt2.x)/2.0,
                y: (pt1.y + pt2.y)/2.0
            };
            let len = p2pDistance(pt1, pt2)/2.0;
            pt1.y = midPoint.y;
            pt2.y = midPoint.y;
            if (pt1.x > midPoint.x) {
                pt1.x = midPoint.x + len;
                pt2.x = midPoint.x - len;
            } else {
                pt1.x = midPoint.x - len;
                pt2.x = midPoint.x + len;
            }
        }
        
        pointsArr[0] = pt1;
        pointsArr[1] = pt2;
    }
    let result = {
        shape: isLine ? GeometricShape.LINE : GeometricShape.UNKNOWN,
        vertices: isLine ? pointsArr : null,
        boundingRect: null
    };
    return result;
}

function findMinXIndex(pts) {
    if (pts.length == 0) {
        return -1;
    }
    let index = 0;
    let minX = Number.MAX_VALUE;
    for (let i = 0; i < pts.length; ++i) {
        if (minX > pts[i].x) {
            minX = pts[i].x;
            index = i;
        }
    }
    return index;
}

function findMaxXIndex(pts) {
    if (pts.length == 0) {
        return -1;
    }
    let index = 0;
    let maxX = Number.MIN_VALUE;
    for (let i = 0; i < pts.length; ++i) {
        if (maxX < pts[i].x) {
            maxX = pts[i].x;
            index = i;
        }
    }
    return index;
}

function getAngleDifference(a1, a2) {
    if (a1 >= a2) {
        a2 += 2 * Math.PI;
    }
    let ret = a2 - a1;

    if (ret >= 2 * Math.PI) {
        ret = 0.0;
    }

    return ret;
}

const Side = {
    NoSide : 0,
    LeftHand : 1,
    RightHand : 2,
    BothSides : 3
};

function getSideOfPoint(startPoint, endPoint, point) {
    let entityAngle = getAngleTo(startPoint, endPoint);
    let angleToCoord = getAngleTo(startPoint, point);
    let angleDiff = getAngleDifference(entityAngle, angleToCoord);

    if (angleDiff < Math.PI) {
        return Side.LeftHand;
    }
    else {
        return Side.RightHand;
    }
}

 function guessTriangle(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 3) {
        return false;
    }

    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);
    //cv::approxPolyDP(pts, output, 5.0, true);
    console.log("convex hull vertex size = ",  output.rows);
    let points = pointsArrayFromMat32S(output);
    let alt = largestTriangleArea(points);

    let ach = cv.contourArea(output);

    output.delete();

    let ratio = alt / ach;

    console.log("alt = ", alt);
    console.log("ach = ", ach);
    console.log("alt/ach = ", ratio);

    let isTriangle = false;
    if (ratio <= 1.0 && ratio >= 0.75) {
        isTriangle = true;
    }

    let rect = {};
    let pointsArr = new Array();
    if (isTriangle) {
        let arr = pointsArrayFromMat32S(pts);
        let vertices = new Array();
        let value = -1;
        let sz = arr.length;
        for (let i = 0; i < sz; ++i) {
            for (let j = i + 1; j < sz; ++j) {
                for (let k = j + 1; k < sz; ++k) {
                    let area = areaOfTriangle(arr[i], arr[j], arr[k]);
                    if (value < area) {
                        value = area;
                        vertices[0] = arr[i];
                        vertices[0].z = 0;
                        vertices[1] = arr[j];
                        vertices[1].z = 0;
                        vertices[2] = arr[k];
                        vertices[2].z = 0;
                    }
                }
            }
        }
        let length = (p2pDistance(vertices[0], vertices[1]) + p2pDistance(vertices[1], vertices[2]) + p2pDistance(vertices[2], vertices[0])) / 3.0;
        let centroid = triangleCentroid(vertices[0], vertices[1], vertices[2]);

        // direction: left to right
        let idx1 = findMinXIndex(vertices);
        let idx2 = findMaxXIndex(vertices);

        let pt1 = new cv.Point(centroid.x, centroid.y-1.732051/3.0*length);
        let pt2 = new cv.Point(centroid.x-0.5*length, centroid.y+1.732051/6.0*length);
        let pt3 = new cv.Point(centroid.x+0.5*length, centroid.y+1.732051/6.0*length);

        if (idx1 !== idx2) {
            let indexs = new Array();
            indexs.push(idx1);
            indexs.push(idx2);
            let idx3 = -1;
            for (let i = 0; i < 3; ++i) {
                if (!indexs.includes(i)) {
                    idx3 = i;
                }
            }
            if (idx3 !== -1) {
                let side = getSideOfPoint(vertices[idx1], vertices[idx2], vertices[idx3]);
                if (side === Side.LeftHand) {
                    pt1 = new cv.Point(centroid.x, centroid.y+1.732051/3.0*length);
                    pt2 = new cv.Point(centroid.x-0.5*length, centroid.y-1.732051/6.0*length);
                    pt3 = new cv.Point(centroid.x+0.5*length, centroid.y-1.732051/6.0*length);
                }
            }
        } 

        pointsArr.push(pt1, pt2, pt3);
        rect.tl = new cv.Point(pt2.x, pt1.y);
        rect.br = pt3;
        rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);
    } 

    let result = {
        shape: isTriangle ? GeometricShape.TRIANGLE : GeometricShape.UNKNOWN,
        vertices: pointsArr,
        boundingRect: isTriangle ? rect : null
    };
    return result;
}

function guessRectangle(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 4) {
        return false;
    }

    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);

    let box = cv.minAreaRect(output);
    let per = (box.size.width + box.size.height) * 2;

    let pch = cv.arcLength(output, true);

    output.delete();

    let ratio = pch / per;

    console.log("per = ", per);
    console.log("pch = ", pch);
    console.log("pch/per = ", ratio);

    let isRectangle = false;
    if (ratio <= 1.0 && ratio >= 0.885) {
        isRectangle = true;
    }

    let rect = {};
    let newRotatedRect;
    if (isRectangle) {
        let angle = Math.abs(box.angle) > 45 ? 90 : 0;
        let rotatedBox = new cv.RotatedRect(box.center, box.size, angle);
        newRotatedRect = cv.RotatedRect.points(rotatedBox);
        console.log("--> guessRectangle: angle = ", box.angle);
        console.log("--> guessRectangle: new angle = ", rotatedBox.angle);
        let boundingRect = cv.RotatedRect.boundingRect(rotatedBox);
        rect.tl = new cv.Point(boundingRect.x, boundingRect.y);
        rect.br = new cv.Point(boundingRect.x+boundingRect.width, boundingRect.y+boundingRect.height);
        rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);
    }
    let result = {
        shape: isRectangle ? GeometricShape.RECTANGLE : GeometricShape.UNKNOWN,
        vertices: isRectangle ? newRotatedRect : null,
        boundingRect: isRectangle ? rect : null
    };
    return result;
}

function guessDiamond(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 4) {
        return false;
    }

    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);
    //cv::approxPolyDP(pts, output, 5.0, true);

    console.log("diamond: convex hull vertex size = ", output.rows);

    let box = cv.minAreaRect(output);
    let aer = box.size.width * box.size.height;

    let points = pointsArrayFromMat32S(output);
    let alt = largestTriangleArea(points);

    let ratio = alt / aer;

    console.log("alt = ", alt);
    console.log("aer = ", aer);
    console.log("alt/aer = ", ratio);

    let isDiamond = false;
    if (ratio <= 0.51 && ratio >= 0.0) {
        isDiamond = true;
    }

    let rect = {};
    let translated = new Array();
    if (isDiamond) {
        let box = cv.fitEllipse(output);
        let angle = 0;
        if (box.angle > 45 && box.angle < 135) {
            angle = 90;
        } 
        //let angle = Math.abs(box.angle) > 45 ? 90 : 0;
        let rotatedBox = new cv.RotatedRect(box.center, box.size, angle);
        console.log("--> guessDiamond: angle = ", box.angle);
        console.log("--> guessDiamond: new angle = ", rotatedBox.angle);
        let boundingRect = cv.RotatedRect.boundingRect(rotatedBox);

        let vertices = cv.RotatedRect.points(rotatedBox);
    
        for (let i = 0; i < 4; i++) {
            let pt = new cv.Point();
            pt.x = (vertices[i].x + vertices[(i + 1) % 4].x) / 2.0;
            pt.y = (vertices[i].y + vertices[(i + 1) % 4].y) / 2.0;
            translated[i] = pt;
        }

        rect.tl = new cv.Point(boundingRect.x, boundingRect.y);
        rect.br = new cv.Point(boundingRect.x+boundingRect.width, boundingRect.y+boundingRect.height);
        rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);
    }
    let result = {
        shape: isDiamond ? GeometricShape.DIAMOND : GeometricShape.UNKNOWN,
        vertices: isDiamond ? translated : null,
        boundingRect: isDiamond ? rect : null
    };
    
    output.delete();

    return result;
}

function guessEllipse(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 4) {
        return false;
    }

    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);
    //cv::approxPolyDP(pts, output, 5.0, true);
    console.log("ellipse: convex hull vertex size = ", output.rows);

    let box = cv.minAreaRect(output);
    let aer = box.size.width * box.size.height;

    let points = pointsArrayFromMat32S(output);
    let alt = largestTriangleArea(points);

    let ach = cv.contourArea(output);
    let ach2 = ach * ach;

    let ratio = ach2 / (aer * alt);

    console.log("ach2 = ", ach2);
    console.log("ach = ", ach);
    console.log("ach2/(aer*alt) = ", ratio);

    let isEllipse = false;
    if (ratio <= 4.0 && ratio >= 1.50) {
        isEllipse = true;
    }

    let rect = {};
    let ellipse = {};
    if (isEllipse) {
        let box = cv.fitEllipse(output);
        
        let angle = Math.abs(box.angle) > 45 ? 90 : 0;
        let rotatedBox = new cv.RotatedRect(box.center, box.size, angle);
        console.log("--> guessEllipse: angle = ", box.angle);
        console.log("--> guessEllipse: new angle = ", rotatedBox.angle);
        let boundingRect = cv.RotatedRect.boundingRect(rotatedBox);

        ellipse.x = box.center.x;
        ellipse.y = box.center.y;
        ellipse.radioX = box.size.width/2.0;
        ellipse.radioY = box.size.height/2.0;
        ellipse.rotation = angle;

        rect.tl = new cv.Point(boundingRect.x, boundingRect.y);
        rect.br = new cv.Point(boundingRect.x+boundingRect.width, boundingRect.y+boundingRect.height);
        rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);
    }
    let result = {
        shape: isEllipse ? GeometricShape.ELLIPSE : GeometricShape.UNKNOWN,
        params: isEllipse ? ellipse : null,
        boundingRect: isEllipse ? rect : null
    };
    
    output.delete();

    return result;
}

function guessCircle(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 3) {
        return false;
    }

    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);

    let pch = cv.arcLength(output, true);
    let pch2 = pch * pch;

    let ach = cv.contourArea(output);

    let ratio = pch2 / ach;

    console.log("pch2 = ", pch2);
    console.log("ach = ", ach);
    console.log("ach2/ach = ", ratio);

    let box = cv.fitEllipse(output);
    
    output.delete();

    let isCircle = false;
    if (0.4 * 3.141592 <= ratio && ratio <= 13.2) {
        isCircle = true;
    }
    
    let circle = {};
    let rect = {};
    if (isCircle) {
        circle.center = box.center;
        circle.radio = (box.size.width + box.size.height)/4.0;
    
        rect.tl = new cv.Point(box.center.x-box.size.width, box.center.y-box.size.height);
        rect.br = new cv.Point(box.center.x+box.size.width, box.center.y+box.size.height);
        rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);    
    }

    let result = {
        shape: isCircle ? GeometricShape.CIRCLE : GeometricShape.UNKNOWN,
        params: isCircle ? circle : null,
        boundingRect: isCircle ? rect : null,
    };

    return result;
}

function guessDeletor(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 4) {
        return false;
    }

    let len = cv.arcLength(pts, true);

    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);

    let pch = cv.arcLength(output, true);

    let ratio = len / pch;

    console.log("len = ", len);
    console.log("pch = ", pch);
    console.log("len/pch = ", ratio);

    let isDeletor = false;
    if (ratio > 1.55) {
        isDeletor = true;
    }

    let points = new Array();
    let rect = {};
    if (isDeletor) {
        let out = new cv.Mat();
        cv.approxPolyDP(pts, out, 10.0, true);
        points = pointsArrayFromMat32S(out);
        out.delete();
        let box = cv.minAreaRect(output);
        let boundingRect = cv.RotatedRect.boundingRect(box);
        rect.tl = new cv.Point(boundingRect.x-box.size.width/2, boundingRect.y-box.size.height/2);
        rect.br = new cv.Point(boundingRect.x+box.size.width/2, boundingRect.y+box.size.height/2);
        rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);    
    }

    let result = {
        shape: isDeletor ? GeometricShape.DELETOR : GeometricShape.UNKNOWN,
        vertices: isDeletor ? points : null,
        boundingRect: isDeletor ? rect : null,
    };

    output.delete();

    return result;
}

export function guessArrow(points1, points2)
{    
    let pts1 = cv.matFromArray(points1.length/2, 2, cv.CV_32SC1, points1);
    let arr1 = pointsArrayFromMat32S(pts1);
    if (arr1.length < 2) {
        return null; 
    }

    let pts2 = cv.matFromArray(points2.length/2, 2, cv.CV_32SC1, points2);
    let arr2 = pointsArrayFromMat32S(pts2);
    if (arr2.length < 2) {
        return null; 
    }

    let result1 = guessByDecisionTree(points1);
    const tolarence = -10.0;
    if ((result1.shape == GeometricShape.LINE || result1.shape == GeometricShape.POLYGON) && result1.vertices.length > 1) {
        let result2 = guessTriangle(pts2);
        if (result2.shape == GeometricShape.TRIANGLE) {
            let pt1 = result1.vertices[0];
            let pt2 = result1.vertices[result1.vertices.length - 1];
            let contours = new cv.MatVector();
            contours.push_back(pts2);
            console.log("pt1 = ", pt1);
            console.log("result1 = ", result1);
            let dist = cv.pointPolygonTest(contours.get(0), pt1, true);
        
            if (dist >= tolarence) {
                return result1.vertices.reverse();
            }
            dist = cv.pointPolygonTest(contours.get(0), pt2, true);

            if (dist >= tolarence) {
                return result1.vertices;
            }
        }
    } else {
        let result2 = guessByDecisionTree(points2);
        if ((result2.shape == GeometricShape.LINE || result2.shape == GeometricShape.POLYGON) && result2.vertices.length > 1) {
            let result1 = guessTriangle(pts1);
            if (result1.shape == GeometricShape.TRIANGLE) {
                let pt1 = result2.vertices[0];
                let pt2 = result2.vertices[result2.vertices.length - 1];
                let contours = new cv.MatVector();
                contours.push_back(pts1);
                let dist = cv.pointPolygonTest(contours.get(0), pt1, true);
            
                if (dist >= tolarence) {
                    return result2.vertices.reverse();
                }
                dist = cv.pointPolygonTest(contours.get(0), pt2, true);

                if (dist >= tolarence) {
                    return result2.vertices;
                }
            }
        }
    }

	return null;
}

//let GeometricShape = {
export const  GeometricShape = {
    UNKNOWN : 0,
    LINE : 1,
    DELETOR : 2,
    CIRCLE : 3,
    TRIANGLE : 4,
    RECTANGLE : 5,
    ELLIPSE : 6,
    DIAMOND : 7,
    POLYGON : 8,
    STAR : 9
};

function fittingPolygon(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 4) {
        return false;
    }

    let output = new cv.Mat();
    cv.convexHull(pts, output, false, true);

    let points = new Array();
    let rect = {};
    let out = new cv.Mat();
    cv.approxPolyDP(pts, out, 10.0, false);
    points = pointsArrayFromMat32S(out);

    let psArr = [];
    for (let i = 0; i < points.length; ++i) {
        let pt = new Array();
        pt[0] = points[i].x;
        pt[1] = points[i].y;
        psArr[i] = pt;
    }

    let degree = 2;
    let knots = [];
    let step = degree + 1;
    let count = (degree + 1 + points.length);

    for (let i = 0; i < count; ++i) {
        if (i < step) {
            knots[i] = 0;
        } else if (i >= count - step) {
            knots[i] = count - 2*step + 1;
        } else {
            knots[i] = i - step + 1;
        }
    }

    let index = 0;
    let ppoints = new Array();
    for(let t = 0; t < 1; t += 0.01) {
        let point = bsplineInterpolate(t, degree, psArr, knots);
        if (point !== undefined && point[0] !== Number.NaN && point[1] !== Number.NaN) {
            let pt = new cv.Point();
            pt.x = point[0];
            pt.y = point[1];
            ppoints[index++] = pt;
          }
    }

    out.delete();
    let box = cv.minAreaRect(output);
    let boundingRect = cv.RotatedRect.boundingRect(box);
    rect.tl = new cv.Point(boundingRect.x-box.size.width/2, boundingRect.y-box.size.height/2);
    rect.br = new cv.Point(boundingRect.x+box.size.width/2, boundingRect.y+box.size.height/2);
    rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);    

    let result = {
        shape: GeometricShape.POLYGON,
        vertices: ppoints,
        boundingRect: rect
    };

    output.delete();

    return result;
}

function calculatingDefects(pts) {
    let output = new cv.Mat();
    cv.approxPolyDP(pts, output, 5.0, true);
    let points = pointsArrayFromMat32S(output);
    output.delete();
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    for (let i = 0; i < points.length; ++i) {
        if (points[i].x > maxX) {
            maxX = points[i].x;
        }
        if (points[i].y > maxY) {
            maxY = points[i].y;
        }
        if (points[i].x < minX) {
            minX = points[i].x;
        }
        if (points[i].y < minY) {
            minY = points[i].y;
        }
    }

    let boundingW = maxX - minX;
    let boundingH = maxY - minY;

    let frameW = 100;
    let frameH = 100;

    let normalized = new Array();
    for (let i = 0; i < points.length; ++i) {
        let pt = new cv.Point(((points[i].x - minX) / boundingW) * frameW, ((points[i].y - minY) / boundingH) * frameH);
        normalized[i] = pt;
    }
    
    let bg = cv.Mat.zeros(frameW, frameH, cv.CV_8UC1);
    let color = new cv.Scalar(255, 255, 255);
    for (let i = 0; i < normalized.length; ++i) {
        cv.line(bg, normalized[i], normalized[(i+1)%normalized.length], color, 2, cv.LINE_AA, 0);
    }

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(bg, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    let depthArr = new Array();
    if (contours.size() > 0) {
        let hull = new cv.Mat();
        let defect = new cv.Mat();
        let cnt = contours.get(0);
        let lineColor = new cv.Scalar(255, 0, 0);
        cv.convexHull(cnt, hull, false, false);
        cv.convexityDefects(cnt, hull, defect);
        for (let i = 0; i < defect.rows; ++i) {
            let start = new cv.Point(cnt.data32S[defect.data32S[i * 4] * 2], cnt.data32S[defect.data32S[i * 4] * 2 + 1]);
            let end = new cv.Point(cnt.data32S[defect.data32S[i * 4 + 1] * 2], cnt.data32S[defect.data32S[i * 4 + 1] * 2 + 1]);
            let far = new cv.Point(cnt.data32S[defect.data32S[i * 4 + 2] * 2], cnt.data32S[defect.data32S[i * 4 + 2] * 2 + 1]);
            let depth = defect.data32S[i * 4 + 3]/256;
            console.log(" --> start = ", start);
            console.log(" --> end = ", end);
            console.log(" --> far = ", far);
            console.log(" --> depth = ", depth);
            depthArr.push(depth);
        }
        bg.delete(); 
        hierarchy.delete(); 
        contours.delete();
        hull.delete();
        defect.delete();
    }

    return depthArr;
}

function isContourConvex(pts) {
    let depthArr = calculatingDefects(pts);
    let maxDepth = Number.MIN_VALUE;
    for (let i = 0; i < depthArr.length; ++i) {
        if (maxDepth < depthArr[i]) {
            maxDepth = depthArr[i];
        }
    }
    return maxDepth <= 20 ? true : false;
}

function guessStar(pts) {
    console.log("pts.rows = ", pts.rows);
    if (pts.rows < 3) {
        return false;
    }

    let depthArr = calculatingDefects(pts);
    let depthCount = 0;
    for (let i = 0; i < depthArr.length; ++i) {
        if (depthArr[i] > 10) {
            ++depthCount;
        }
    }

    let isStar = (depthCount === 5);
    
    let star = {};
    let rect = {};
    if (isStar) {
        let output = new cv.Mat();
        cv.convexHull(pts, output, false, true);
        let box = cv.minAreaRect(output);

        star.center = box.center;
        star.radio = (box.size.width + box.size.height)/4.0;
    
        rect.tl = new cv.Point(box.center.x-star.radio, box.center.y-star.radio);
        rect.br = new cv.Point(box.center.x+star.radio, box.center.y+star.radio);
        rect.center = new cv.Point((rect.tl.x+rect.br.x)/2, (rect.tl.y+rect.br.y)/2);    
    }

    let result = {
        shape: isStar ? GeometricShape.STAR : GeometricShape.UNKNOWN,
        params: isStar ? star : null,
        boundingRect: isStar ? rect : null,
    };

    return result;
}

function guessByDecisionTree(points) {
    let pts = cv.matFromArray(points.length/2, 2, cv.CV_32SC1, points);
    let arr = pointsArrayFromMat32S(pts);
    if (arr.length < 1) {
        return GeometricShape.UNKNOWN; 
    }

    let pt1 = arr[0];
    let pt2 = arr[arr.length - 1];
    let dist = p2pDistance(pt1, pt2);
    let isClosed = dist < 30 ? true : false;
    console.log(" --> isClosed = ", isClosed);
    if (isClosed) {
        //let isConvex = cv.isContourConvex(output);
        let isConvex = isContourConvex(pts);
        console.log(" --> isConvex = ", isConvex);

        if (isConvex) {
            let result = guessCircle(pts);
            if (result.shape == GeometricShape.CIRCLE) {
                console.log("it is a circle.");
                return result;
            }
    
            result = guessTriangle(pts);
            if (result.shape == GeometricShape.TRIANGLE) {
                console.log("it is a triangle.");
                return result;
            }
            
            result = guessRectangle(pts);
            if (result.shape == GeometricShape.RECTANGLE) {
                console.log("it is a rectrangle.");
                return result;
            }
            
            result = guessEllipse(pts);
            if (result.shape == GeometricShape.ELLIPSE) {
                console.log("it is a ellipse.");
                return result;
            }
            
            result = guessDiamond(pts);
            if (result.shape == GeometricShape.DIAMOND) {
                console.log("it is a diamond.");
                return result;
            }
        } else {
            let result = guessStar(pts);
            if (result.shape == GeometricShape.STAR) {
                console.log("it is a star.");
                return result;
            }
        }
    } else {
        let result = guessDeletor(pts);
        if (result.shape == GeometricShape.DELETOR) {
            console.log("it is a deletor.");
            return result;
        }

        result = guessLine(pts);
        if (result.shape == GeometricShape.LINE) {
            console.log("it is a line.");
            return result;
        } 
    }
    
    return fittingPolygon(pts);
}

/**
 * @param {Array<number>} arr
 * */
export function guessShape(arr) {
    return guessByDecisionTree(arr);
}
