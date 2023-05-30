document.addEventListener('DOMContentLoaded', function () {

    const go = window.go;

    function init() {
        const $ = go.GraphObject.make;  // для краткости в определении шаблонов

        myDiagram =
            $(go.Diagram, "myDiagramDiv",  // должен называть или ссылаться на HTML-элемент DIV
                {
                    grid: $(go.Panel, "Grid",
                        $(go.Shape, "LineH", {stroke: "lightgray", strokeWidth: 0.5}),
                        $(go.Shape, "LineH", {stroke: "gray", strokeWidth: 0.5, interval: 10}),
                        $(go.Shape, "LineV", {stroke: "lightgray", strokeWidth: 0.5}),
                        $(go.Shape, "LineV", {stroke: "gray", strokeWidth: 0.5, interval: 10})
                    ),
                    "draggingTool.dragsLink": true,
                    "draggingTool.isGridSnapEnabled": true,
                    "linkingTool.isUnconnectedLinkValid": true,
                    "linkingTool.portGravity": 20,
                    "relinkingTool.isUnconnectedLinkValid": true,
                    "relinkingTool.portGravity": 20,
                    "relinkingTool.fromHandleArchetype":
                        $(go.Shape, "Diamond", {
                            segmentIndex: 0,
                            cursor: "pointer",
                            desiredSize: new go.Size(8, 8),
                            fill: "tomato",
                            stroke: "darkred"
                        }),
                    "relinkingTool.toHandleArchetype":
                        $(go.Shape, "Diamond", {
                            segmentIndex: -1,
                            cursor: "pointer",
                            desiredSize: new go.Size(8, 8),
                            fill: "darkred",
                            stroke: "tomato"
                        }),
                    "linkReshapingTool.handleArchetype":
                        $(go.Shape, "Diamond", {
                            desiredSize: new go.Size(7, 7),
                            fill: "lightblue",
                            stroke: "deepskyblue"
                        }),
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
            // порт в основном просто маленький прозрачный круг
            return $(go.Shape, "Circle",
                {
                    fill: null,  //по умолчанию не виден; установите полупрозрачный серый цвет с помощью showSmallPorts, как указано ниже
                    stroke: null,
                    desiredSize: new go.Size(7, 7),
                    alignment: spot,  //выровняйте порт на основной форме
                    alignmentFocus: spot,  // только внутри формы
                    portId: name,  // объявить этот объект "портом"
                    fromSpot: spot, toSpot: spot,  //объявить, где ссылки могут подключаться к этому порту
                    fromLinkable: output, toLinkable: input,  //объявить, может ли пользователь делать ссылки сюда/отсюда
                    cursor: "pointer"  // показать другой курсор, чтобы указать потенциальную точку ссылки
                });
        }

        var nodeSelectionAdornmentTemplate =
            $(go.Adornment, "Auto",
                $(go.Shape, {fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2]}),
                $(go.Placeholder)
            );

        var nodeResizeAdornmentTemplate =
            $(go.Adornment, "Spot",
                {locationSpot: go.Spot.Right},
                $(go.Placeholder),
                $(go.Shape, {
                    alignment: go.Spot.TopLeft,
                    cursor: "nw-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),
                $(go.Shape, {
                    alignment: go.Spot.Top,
                    cursor: "n-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),
                $(go.Shape, {
                    alignment: go.Spot.TopRight,
                    cursor: "ne-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),

                $(go.Shape, {
                    alignment: go.Spot.Left,
                    cursor: "w-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),
                $(go.Shape, {
                    alignment: go.Spot.Right,
                    cursor: "e-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),

                $(go.Shape, {
                    alignment: go.Spot.BottomLeft,
                    cursor: "se-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),
                $(go.Shape, {
                    alignment: go.Spot.Bottom,
                    cursor: "s-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),
                $(go.Shape, {
                    alignment: go.Spot.BottomRight,
                    cursor: "sw-resize",
                    desiredSize: new go.Size(6, 6),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                })
            );

        var nodeRotateAdornmentTemplate =
            $(go.Adornment,
                {locationSpot: go.Spot.Center, locationObjectName: "ELLIPSE"},
                $(go.Shape, "Ellipse", {
                    name: "ELLIPSE",
                    cursor: "pointer",
                    desiredSize: new go.Size(7, 7),
                    fill: "lightblue",
                    stroke: "deepskyblue"
                }),
                $(go.Shape, {
                    geometryString: "M3.5 7 L3.5 30",
                    isGeometryPositioned: true,
                    stroke: "deepskyblue",
                    strokeWidth: 1.5,
                    strokeDashArray: [4, 2]
                })
            );

        myDiagram.nodeTemplate =
            $(go.Node, "Spot",
                {locationSpot: go.Spot.Center},
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                {selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate},
                {resizable: false, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate},
                {rotatable: false, rotateAdornmentTemplate: nodeRotateAdornmentTemplate},
                new go.Binding("angle").makeTwoWay(),
                // основной объект - это панель, которая окружает TextBlock с формой
                $(go.Panel, "Auto",
                    {name: "PANEL"},
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                    $(go.Shape, "Rectangle",  //фигура по умолчанию
                        {
                            portId: "", // порт по умолчанию: если нет точки на данных ссылки, используйте ближайшую сторону
                            fromLinkable: true, toLinkable: true, cursor: "pointer",
                            fill: "white",  // цвет по умолчанию
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
                    {isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0})  // use selection object's strokeWidth
            );

        myDiagram.linkTemplate =
            $(go.Link,  // вся панель ссылок
                {selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate},
                {relinkableFrom: true, relinkableTo: true, reshapable: true},
                {
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 5,
                    toShortLength: 4
                },
                new go.Binding("points").makeTwoWay(),
                $(go.Shape,  // форма пути ссылки
                    {isPanelMain: true, strokeWidth: 2,},),
                $(go.Shape,  // наконечник стрелы
                    {toArrow: "Standard", stroke: null}),
                $(go.Panel, "Auto",
                    new go.Binding("fill", "isSelected").ofObject(), //видимость текста на стрелках, "fill" меняем на "visible"
                    $(go.Shape, "RoundedRectangle",  // форма ссылки
                        {fill: "transparent", stroke: null}),
                    $(go.TextBlock,
                        {
                            textAlign: "end",
                            font: "9pt helvetica, arial, sans-serif",
                            stroke: "black",
                            margin: 2,
                            minSize: new go.Size(60, 40),
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
                    initialScale: 0.94,
                    maxSelectionCount: 1,
                    nodeTemplateMap: myDiagram.nodeTemplateMap,  // поделитесь шаблонами, используемыми myDiagram
                    linkTemplate: // упростить шаблон ссылки, только в этой палитре
                        $(go.Link,
                            { // потому что GridLayout.alignment is Location and the nodes (узлы) have locationSpot == Spot.Center,
                                //чтобы выстроить ссылку таким же образом, мы должны притвориться, что ссылка находится в том же месте
                                locationSpot: go.Spot.Center,
                                selectionAdornmentTemplate:
                                    $(go.Adornment, "Link",
                                        {locationSpot: go.Spot.Center},
                                        $(go.Shape,
                                            {isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0}),
                                        $(go.Shape,  // наконечник стрелы
                                            {toArrow: "Standard", stroke: null})
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
                                {isPanelMain: true, strokeWidth: 2}),
                            $(go.Shape,  // the arrowhead
                                {toArrow: "Standard", stroke: null}),
                        ),

                    model: new go.GraphLinksModel([  // указать содержимое палитры
                        {figure: "Spot", "size": "105 75", fill: "transparent"}, //спустить все элементы, чтобы скрыть надпись
                        {text: "Начало", figure: "Start", "size": "150 60", fill: "#FFFFFF"},
                        {text: "Действие", figure: "Action", "size": "150 100", fill: "#FFFFFF"},
                        {text: "Условие", figure: "Сondition", "size": "150 100", fill: "#FFFFFF"},
                        {text: "Начало цикла", figure: "LoopStart", "size": "150 100", fill: "#FFFFFF"},
                        {text: "Конец цикла", figure: "LoopEnd", "size": "150 100", fill: "#FFFFFF"},
                        {text: "Ввод", figure: "Input", "size": "150 100", fill: "#FFFFFF"},
                        {text: "Вывод", figure: "Output", "size": "150 100", fill: "#FFFFFF"},
                        {text: "Конец", figure: "End", "size": "150 60", fill: "#FFFFFF"},
                        {text: "1", figure: "Ellipse", "size": "60 60", fill: "#FFFFFF"}
                    ], [
                        // Палитра также имеет отключенную ссылку, которую пользователь может перетащить
                        {points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)])}
                    ],)
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