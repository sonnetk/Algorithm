document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        function ShapeToCode(shape) {
            switch (shape.figure) {
                case 'Start':
                    code += `begin\n`
                    break
                case 'Action':
                    code += `${shape.text.replace('=', ':=')};\n`
                    break
                case 'Input':
                    code += `readln(${shape.text});\n`
                    break
                case 'Output':
                    code += `writeln(${shape.text});\n`
                    break
                case 'LoopStart':
                    code += `for ${shape.text.replace('=', ':=').replace(',', ' to')} do\nbegin\n`
                    break
                case 'LoopEnd':
                    code += `end;\n`
                    break
                case 'End':
                    code += `end.`
                    break
            }
        }

        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray

        let code = ''

        let start = shapes.filter(item => item.figure === 'Start')
        if (start.length === 0) {
            alert('Не найден блок "Начало"')
            return
        }
        if (start.length > 1) {
            alert('Обнаружены несколько блоков "Начало"')
            return
        }
        let shape = start[0]

        while (true) {
            ShapeToCode(shape)

            if (shape.figure === 'End') {
                ace.edit('editorCode').setValue(code)
                break
            }

            if (shape.figure === 'Ref') {
                let second_shape = shapes.filter(item => item.text === shape.text && item.key !== shape.key)
                if (second_shape.length === 0) {
                    alert(`Не найдена вторая ссылка со значением "${shape.text}"`)
                    break
                }
                if (second_shape.length > 1) {
                    alert(`Ссылок со значением "${shape.text}" больше двух`)
                    break
                }
                shape = second_shape[0]
            }

            let link = links.filter(item => item.from === shape.key)
            if (link.length === 0) {
                alert('Не обнаружен блок "Конец"')
                break
            }
            if (link.length > 1) {
                alert('Обнаружено несколько выходов из блока, не позволяющего ветвление')
                break
            }
            link = link[0]

            shape = shapes.find(item => item.key === link.to)
            if (!shape) {
                alert('Не обнаружен блок "Конец"')
                break
            }
        }
    })
})