document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray

        function ShapeToCode(shape) {
            let result = ''
            switch (shape.figure) {
                case 'Start':
                    result += `begin\n`
                    break
                case 'Action':
                    result += `${shape.text.replace('=', ':=')};\n`
                    break
                case 'Input':
                    result += `readln(${shape.text});\n`
                    break
                case 'Output':
                    result += `writeln(${shape.text});\n`
                    break
                case 'LoopStart':
                    result += `for ${shape.text.replace('=', ':=').replace(',', ' to')} do\nbegin\n`
                    break
                case 'LoopEnd':
                    result += `end;\n`
                    break
                case 'End':
                    result += `end.`
                    break
            }

            return result
        }

        function NextShape(shape) {
            if (shape.figure === 'Ref') {
                let second_shape = shapes.filter(item => item.text === shape.text && item.key !== shape.key)
                if (second_shape.length === 0) throw new Error(`Не найдена вторая ссылка со значением "${shape.text}"`)
                if (second_shape.length > 1) throw new Error(`Ссылок со значением "${shape.text}" больше двух`)
                shape = second_shape[0]
            }

            let link = links.filter(item => item.from === shape.key)
            if (link.length === 0) throw new Error('Не обнаружен блок "Конец"')
            if (link.length > 1) throw new Error('Обнаружено несколько выходов из блока, не позволяющего ветвление')
            link = link[0]

            shape = shapes.find(item => item.key === link.to)
            if (!shape) throw new Error('Не обнаружен блок "Конец"')

            return shape
        }

        try {
            let code = ''

            let start = shapes.filter(item => item.figure === 'Start')
            if (start.length === 0) throw new Error('Не найден блок "Начало"')
            if (start.length > 1) throw new Error('Обнаружены несколько блоков "Начало"')
            let shape = start[0]

            while (shape.figure !== 'End') {
                code += ShapeToCode(shape)
                shape = NextShape(shape)
            }

            code += ShapeToCode(shape)
            ace.edit('editorCode').setValue(code)

        } catch (error) {
            alert(error.message);
        }
    })
})