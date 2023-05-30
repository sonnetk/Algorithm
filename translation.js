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

            if (shape.figure === 'LoopStart') {
                pascal_code += `for ${shape.text.replace('=', ':=').replace(',', ' to')} do
begin
`
            }

            if (shape.figure === 'LoopEnd') {
                pascal_code += `end;
`
            }

            if (shape.figure === 'End') {
                pascal_code += `end.`
                break
            }

            if (shape.figure === 'Ref') {
                const second_ref = shapes.find(item => item.text === shape.text && item.key !== shape.key)
                if (!second_ref) break

                link = links.find(item => item.from === second_ref.key)
                if (!link) break

            } else {
                link = links.find(item => item.from === shape.key)
                if (!link) break
            }

            shape = shapes.find(item => item.key === link.to)
            if (!shape) break
        }

        ace.edit('editorCode').setValue(pascal_code)
    })
})