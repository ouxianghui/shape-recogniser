# shape-recogniser
基于opencv的手写图形识别，并将手写图形映射为标准图形

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

目前支持直线、三角形、矩形、圆、椭圆、菱形、折线（bspline, B样条插值）、五角星，以及擦除手势。
