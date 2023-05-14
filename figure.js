document.addEventListener('DOMContentLoaded', function () {

    go.Shape.defineFigureGenerator("Spot", function(shape, w, h) {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(0, 0, true);
        geo.add(fig);

        fig.add(new go.PathSegment(go.PathSegment.Line, 0, 0).close());
        return geo;
    });

    go.Shape.defineFigureGenerator("Start", function(shape, w, h) {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(.25 * w, 0, true);
        geo.add(fig);

        fig.add(new go.PathSegment(go.PathSegment.Arc, 270, 180, .75 * w, 0.5 * h, .25 * w, .5 * h));
        fig.add(new go.PathSegment(go.PathSegment.Arc, 90, 180, .25 * w, 0.5 * h, .25 * w, .5 * h));
        geo.spot1 = new go.Spot(0, 0);

        return geo;
    });

    go.Shape.defineFigureGenerator("End", function(shape, w, h) {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(.25 * w, 0, true);
        geo.add(fig);

        fig.add(new go.PathSegment(go.PathSegment.Arc, 270, 180, .75 * w, 0.5 * h, .25 * w, .5 * h));
        fig.add(new go.PathSegment(go.PathSegment.Arc, 90, 180, .25 * w, 0.5 * h, .25 * w, .5 * h));
        geo.spot1 = new go.Spot(0, 0);
        return geo;
    });

    go.Shape.defineFigureGenerator("Action", function(shape, w, h) {  // predefined in 2.0
        var geo = new go.Geometry(go.Geometry.Rectangle);
        geo.startX = 0;
        geo.startY = 0;
        geo.endX = w;
        geo.endY = h;
        return geo;
    });

    go.Shape.defineFigureGenerator("Сondition", function(shape, w, h) {  // predefined in 2.0
        return new go.Geometry()
            .add(new go.PathFigure(0.5 * w, 0)
                .add(new go.PathSegment(go.PathSegment.Line, 0, 0.5 * h))
                .add(new go.PathSegment(go.PathSegment.Line, 0.5 * w, h))
                .add(new go.PathSegment(go.PathSegment.Line, w, 0.5 * h).close()))
            .setSpots(0.25, 0.25, 0.75, 0.75);
    });

    go.Shape.defineFigureGenerator("Input", function(shape, w, h) {
        var param1 = shape ? shape.parameter1 : NaN; // indent's percent distance
        if (isNaN(param1)) param1 = 0.1;
        else if (param1 < -1) param1 = -1;
        else if (param1 > 1) param1 = 1;
        var indent = Math.abs(param1) * w;


        if (param1 === 0) {
            var geo = new go.Geometry(go.Geometry.Rectangle);
            geo.startX = 0;
            geo.startY = 0;
            geo.endX = w;
            geo.endY = h;
            return geo;
        } else {
            var geo = new go.Geometry();
            if (param1 > 0) {
                geo.add(new go.PathFigure(indent, 0)
                    .add(new go.PathSegment(go.PathSegment.Line, w, 0))
                    .add(new go.PathSegment(go.PathSegment.Line, w - indent, h))
                    .add(new go.PathSegment(go.PathSegment.Line, 0, h).close()));
            } else {  // param1 < 0
                geo.add(new go.PathFigure(0, 0)
                    .add(new go.PathSegment(go.PathSegment.Line, w - indent, 0))
                    .add(new go.PathSegment(go.PathSegment.Line, w, h))
                    .add(new go.PathSegment(go.PathSegment.Line, indent, h).close()));
            }
            if (indent < w / 2) {
                geo.setSpots(indent / w, 0, (w - indent) / w, 1);
            }
            return geo;
        }
    });

    go.Shape.defineFigureGenerator("Output", "Input");

    go.Shape.defineFigureGenerator("LoopStart", function(shape, w, h) {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(0, h, true);
        geo.add(fig);

        fig.add(new go.PathSegment(go.PathSegment.Line, 0, .25 * h));
        fig.add(new go.PathSegment(go.PathSegment.Line, .25 * w, 0));
        fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, 0));
        fig.add(new go.PathSegment(go.PathSegment.Line, w, .25 * h));
        fig.add(new go.PathSegment(go.PathSegment.Line, w, h).close());
        geo.spot1 = new go.Spot(0, .25);
        geo.spot2 = go.Spot.BottomRight;
        return geo;
    });

    go.Shape.defineFigureGenerator("LoopEnd", function(shape, w, h) {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(0, 0, true);
        geo.add(fig);

        fig.add(new go.PathSegment(go.PathSegment.Line, w, 0));
        fig.add(new go.PathSegment(go.PathSegment.Line, w, .75 * h));
        fig.add(new go.PathSegment(go.PathSegment.Line, .75 * w, h));
        fig.add(new go.PathSegment(go.PathSegment.Line, .25 * w, h));
        fig.add(new go.PathSegment(go.PathSegment.Line, 0, .75 * h).close());

        geo.spot1 = new go.Spot(0, 0);
        geo.spot2 = go.Spot.BottomRight;
        return geo;
    });

    go.Shape.defineFigureGenerator("HexagonPr", function(shape, w, h) {
        var points = createPolygon(6);
        var geo = new go.Geometry();
        var fig = new go.PathFigure(points[0].y * w, points[0].x * h, true);
        geo.add(fig);

        for (var i = 1; i < 6; i++) {
            fig.add(new go.PathSegment(go.PathSegment.Line, points[i].y * w, points[i].x * h));
        }
        fig.add(new go.PathSegment(go.PathSegment.Line, points[0].y * w, points[0].x * h).close());
        freeArray(points);
        geo.spot1 = new go.Spot(.07, .25);
        geo.spot2 = new go.Spot(.90, .75);
        return geo;
    });

    go.Shape.defineFigureGenerator("Ellipse", function(shape, w, h) {  // predefined in 2.0
        var geo = new go.Geometry(go.Geometry.Ellipse);
        geo.startX = 0;
        geo.startY = 0;
        geo.endX = w;
        geo.endY = h;
        geo.spot1 = GeneratorEllipseSpot1;
        geo.spot2 = GeneratorEllipseSpot2;
        return geo;
    });

}, false);