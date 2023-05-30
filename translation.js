document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray

        let shape
        let link
        let pascal_code

        shape = shapes.find(item => item.figure === 'Start')
        pascal_code = 'begin<br>'

        link = links.find(item => item.from === shape.key)
        shape = shapes.find(item => item.key === link.to)

        while (true) {
            if (shape.figure === 'Action') {
                pascal_code += shape.text.replace('=', ':=') + ';<br>'
            }

            if (shape.figure === 'End') {
                pascal_code += 'end.'
                break
            }

            link = links.find(item => item.from === shape.key)
            if (!link) break

            shape = shapes.find(item => item.key === link.to)
            if (!shape) break
        }

        document.getElementById('editorCode').innerHTML = pascal_code
    })
})