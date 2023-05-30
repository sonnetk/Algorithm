document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray

        let pascal_code = ''

        let shape = shapes.find(item => item.figure === 'Start');
        if (!shape) return

        do {
            if (shape.figure === 'Start') {
                pascal_code += `begin
`
            }

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
                shape = shapes.find(item => item.text === shape.text && item.key !== shape.key)
                if (!shape) break
            }

            const link = links.find(item => item.from === shape.key)
            if (!link) break

            shape = shapes.find(item => item.key === link.to)
        } while (shape)

        ace.edit('editorCode').setValue(pascal_code)
    })
})