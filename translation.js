document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray

        let shape
        let link
        let pascal_code

        shape = shapes.find(item => item.figure === 'Start')
        if (!shape) return

        pascal_code = `begin
`

        link = links.find(item => item.from === shape.key)
        shape = shapes.find(item => item.key === link.to)

        while (true) {
            if (shape.figure === 'Action') {
                pascal_code += `${shape.text.replace('=', ':=')};
`
            }

            if (shape.figure === 'Input') {
                pascal_code += `readln(${shape.text});
`
            }

            if (shape.figure === 'Output') {
                pascal_code += `writeln(${shape.text});
`
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

        ace.edit('editorCode').setValue(pascal_code)
    })
})