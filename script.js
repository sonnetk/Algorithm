document.addEventListener('DOMContentLoaded', function () {
    go.Shape.defineFigureGenerator("LoopLimitPr", function(shape, w, h) {
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

    go.Shape.defineFigureGenerator("Spot", function(shape, w, h) {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(0, 0, true);
        geo.add(fig);

        fig.add(new go.PathSegment(go.PathSegment.Line, 0, 0).close());
        return geo;
    });

    function init() {

        const $ = go.GraphObject.make;  // для краткости в определении шаблонов

        myDiagram =
            $(go.Diagram, "myDiagramDiv",  // должен называть или ссылаться на HTML-элемент DIV
                {
                    grid: $(go.Panel, "Grid",
                        $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                        $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
                        $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
                        $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
                    ),
                    "draggingTool.dragsLink": true,
                    "draggingTool.isGridSnapEnabled": true,
                    "linkingTool.isUnconnectedLinkValid": true,
                    "linkingTool.portGravity": 20,
                    "relinkingTool.isUnconnectedLinkValid": true,
                    "relinkingTool.portGravity": 20,
                    "relinkingTool.fromHandleArchetype":
                        $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
                    "relinkingTool.toHandleArchetype":
                        $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
                    "linkReshapingTool.handleArchetype":
                        $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
                    "rotatingTool.handleAngle": 270,
                    "rotatingTool.handleDistance": 30,
                    "rotatingTool.snapAngleMultiple": 15,
                    "rotatingTool.snapAngleEpsilon": 15,
                    "undoManager.isEnabled": true
                });

        //когда документ изменен, добавьте «*» к заголовку и включите кнопку «Сохранить»
        myDiagram.addDiagramListener("Modified", e => {
            var button = document.getElementById("SaveButton");
            if (button) button.disabled = !myDiagram.isModified;
            var idx = document.title.indexOf("*");
            if (myDiagram.isModified) {
                if (idx < 0) document.title += "*";
            } else {
                if (idx >= 0) document.title = document.title.slice(0, idx);
            }
        });

        // Определяем функцию для создания "порта", который обычно прозрачен.
        // «Имя» используется как GraphObject.portId, «место» используется для управления подключением ссылок
        // и расположение порта на узле, а также логические аргументы "выход" и "вход"
        // управлять тем, может ли пользователь рисовать ссылки из или в порт.
        function makePort(name, spot, output, input) {
            // the port is basically just a small transparent circle
            return $(go.Shape, "Circle",
                {
                    fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
                    stroke: null,
                    desiredSize: new go.Size(7, 7),
                    alignment: spot,  // align the port on the main Shape
                    alignmentFocus: spot,  // just inside the Shape
                    portId: name,  // declare this object to be a "port"
                    fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                    fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                    cursor: "pointer"  // show a different cursor to indicate potential link point
                });
        }

        var nodeSelectionAdornmentTemplate =
            $(go.Adornment, "Auto",
                $(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
                $(go.Placeholder)
            );

        var nodeResizeAdornmentTemplate =
            $(go.Adornment, "Spot",
                { locationSpot: go.Spot.Right },
                $(go.Placeholder),
                $(go.Shape, { alignment: go.Spot.TopLeft, cursor: "nw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
                $(go.Shape, { alignment: go.Spot.Top, cursor: "n-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
                $(go.Shape, { alignment: go.Spot.TopRight, cursor: "ne-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

                $(go.Shape, { alignment: go.Spot.Left, cursor: "w-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
                $(go.Shape, { alignment: go.Spot.Right, cursor: "e-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),

                $(go.Shape, { alignment: go.Spot.BottomLeft, cursor: "se-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
                $(go.Shape, { alignment: go.Spot.Bottom, cursor: "s-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" }),
                $(go.Shape, { alignment: go.Spot.BottomRight, cursor: "sw-resize", desiredSize: new go.Size(6, 6), fill: "lightblue", stroke: "deepskyblue" })
            );

        var nodeRotateAdornmentTemplate =
            $(go.Adornment,
                { locationSpot: go.Spot.Center, locationObjectName: "ELLIPSE" },
                $(go.Shape, "Ellipse", { name: "ELLIPSE", cursor: "pointer", desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
                $(go.Shape, { geometryString: "M3.5 7 L3.5 30", isGeometryPositioned: true, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] })
            );

        myDiagram.nodeTemplate =
            $(go.Node, "Spot",
                { locationSpot: go.Spot.Center },
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
                { resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
                { rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
                new go.Binding("angle").makeTwoWay(),
                // the main object is a Panel that surrounds a TextBlock with a Shape
                $(go.Panel, "Auto",
                    { name: "PANEL" },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                    $(go.Shape, "Rectangle",  // default figure
                        {
                            portId: "", // the default port: if no spot on link data, use closest side
                            fromLinkable: true, toLinkable: true, cursor: "pointer",
                            fill: "white",  // default color
                            strokeWidth: 2
                        },
                        new go.Binding("figure"),
                        new go.Binding("fill")),
                    $(go.TextBlock,
                        {
                            font: "bold 10pt Helvetica, Arial, sans-serif",
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: true
                        },
                        new go.Binding("text").makeTwoWay())
                ),
                // четыре небольших именованных порта, по одному с каждой стороны:
                makePort("T", go.Spot.Top, false, true),
                makePort("L", go.Spot.Left, true, true),
                makePort("R", go.Spot.Right, true, true),
                makePort("B", go.Spot.Bottom, true, false),
                { // handle mouse enter/leave events to show/hide the ports
                    mouseEnter: (e, node) => showSmallPorts(node, true),
                    mouseLeave: (e, node) => showSmallPorts(node, false)
                }
            );

        function showSmallPorts(node, show) {
            node.ports.each(port => {
                if (port.portId !== "") { // не меняйте порт по умолчанию, это большая фигура
                    port.fill = show ? "rgba(0,0,0,.3)" : null;
                }
            });
        }

        var linkSelectionAdornmentTemplate =
            $(go.Adornment, "Link",
                $(go.Shape,
                    // isPanelMain объявляет, что эта фигура разделяет  Link.geometry
                    { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })  // use selection object's strokeWidth
            );

        myDiagram.linkTemplate =
            $(go.Link,  // вся панель ссылок
                { selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate },
                { relinkableFrom: true, relinkableTo: true, reshapable: true },
                {
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 5,
                    toShortLength: 4
                },
                new go.Binding("points").makeTwoWay(),
                $(go.Shape,  // форма пути ссылки
                    { isPanelMain: true, strokeWidth: 2 }),
                $(go.Shape,  // наконечник стрелы
                    { toArrow: "Standard", stroke: null }),
                $(go.Panel, "Auto",
                    new go.Binding("visible", "isSelected").ofObject(),
                    $(go.Shape, "RoundedRectangle",  // форма ссылки
                        { fill: "#F8F8F8", stroke: null }),
                    $(go.TextBlock,
                        {
                            textAlign: "center",
                            font: "10pt helvetica, arial, sans-serif",
                            stroke: "#919191",
                            margin: 2,
                            minSize: new go.Size(10, NaN),
                            editable: true
                        },
                        new go.Binding("text").makeTwoWay())
                )
            );

        load();  //загрузить исходную диаграмму из некоторого текста JSON

        // инициализировать палитру, которая находится в левой части страницы
        myPalette =
            $(go.Palette, "myPaletteDiv",  //должен называть или ссылаться на HTML-элемент DIV
                {
                    maxSelectionCount: 1,
                    nodeTemplateMap: myDiagram.nodeTemplateMap,  // поделитесь шаблонами, используемыми myDiagram
                    linkTemplate: // упростить шаблон ссылки, только в этой палитре
                        $(go.Link,
                            { // потому что GridLayout.alignment is Location and the nodes (узлы) have locationSpot == Spot.Center,
                                //чтобы выстроить ссылку таким же образом, мы должны притвориться, что ссылка находится в том же месте
                                locationSpot: go.Spot.Center,
                                selectionAdornmentTemplate:
                                    $(go.Adornment, "Link",
                                        { locationSpot: go.Spot.Center },
                                        $(go.Shape,
                                            { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 }),
                                        $(go.Shape,  // the arrowhead
                                            { toArrow: "Standard", stroke: null })
                                    )
                            },
                            {
                                routing: go.Link.AvoidsNodes,
                                curve: go.Link.JumpOver,
                                corner: 5,
                                toShortLength: 4
                            },
                            new go.Binding("points"),
                            $(go.Shape,  // the link path shape
                                { isPanelMain: true, strokeWidth: 2 }),
                            $(go.Shape,  // the arrowhead
                                { toArrow: "Standard", stroke: null })
                        ),

                    model: new go.GraphLinksModel([  // указать содержимое палитры
                        { figure:"Spot", "size":"105 75", fill: "transparent"}, //спустить все элементы, чтобы скрыть надпись
                        { text: "Начало", figure: "Ellipse", "size":"105 50", fill: "#FFFFFF" },
                        { text: "Step", "size":"105 75" },
                        { text: "???", figure: "Diamond", "size":"105 75", fill: "#FFFFFF" },
                        { text: "1", figure: "Ellipse", "size":"50 50", fill: "#FFFFFF" },
                        { text: "Comment", "size":"105 75", figure: "LoopLimit", fill: "#FFFFFF" },
                        { text: "Comment", "size":"105 75", figure: "LoopLimitPr", fill: "#FFFFFF" },
                        { text: "Start", figure: "Input", "size":"105 75", fill: "#FFFFFF" },
                        { text: "Конец", figure: "Ellipse", "size":"105 50", fill: "#FFFFFF" },
                    ], [
                        // Палитра также имеет отключенную ссылку, которую пользователь может перетащить
                        { points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
                    ])
                });
    }


    // Показать модель диаграммы в формате JSON, которую пользователь может редактировать
    function save() {
        saveDiagramProperties();  //сначала сделайте это, прежде чем писать в JSON
        document.getElementById("mySavedModel").value = myDiagram.model.toJson();
        myDiagram.isModified = false;
    }
    function load() {
        myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
        loadDiagramProperties();  //сделайте это после того, как Model.modelData будет помещен в память
    }

    function saveDiagramProperties() {
        myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
    }
    function loadDiagramProperties(e) {
        // установите Diagram.initialPosition, а не Diagram.position, для обработки побочных эффектов инициализации
        var pos = myDiagram.model.modelData.position;
        if (pos) myDiagram.initialPosition = go.Point.parse(pos);
    }
    window.addEventListener('DOMContentLoaded', init);

}, false);