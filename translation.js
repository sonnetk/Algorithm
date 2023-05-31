document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray
        let code = ''

        function ShapeToCode(shape) {
            let code = ''
            if (shape.figure === 'Start') {
                code += `begin\n`
            } else if (shape.figure === 'Action') {
                code += `${shape.text.replace('=', ':=')};\n`
            } else if (shape.figure === 'Input') {
                code += `readln(${shape.text});\n`
            } else if (shape.figure === 'Output') {
                code += `writeln(${shape.text});\n`
            } else if (shape.figure === 'LoopStart') {
                code += `for ${shape.text.replace('=', ':=').replace(',', ' to')} do\nbegin\n`
            } else if (shape.figure === 'LoopEnd') {
                code += `end;\n`
            } else if (shape.figure === 'Condition') {
                code += `if ${shape.text} then\nbegin\n`
            } else if (shape.figure === 'ConditionElse') {
                code += `end;\nelse\nbegin\n`
            } else if (shape.figure === 'ConditionEnd') {
                code += `end;\n`
            } else if (shape.figure === 'End') {
                code += `end.`
            }
            return code
        }

        function NextShape(shape) {
            if (shape.figure === 'Сondition') {
                let next_shape

                ['Да', 'Нет'].forEach(value => {
                    let link = links.filter(item => item.from === shape.key && item.text.toUpperCase() === value.toUpperCase())
                    if (link.length === 0) throw new Error(`Не обнаружен путь со значением "${value}"`)
                    if (link.length > 1) throw new Error(`Обнаружено несколько путей со значением "${value}" из одного условия`)
                    link = link[0]

                    next_shape = shapes.find(item => item.key === link.to)
                    if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

                    while (next_shape.figure !== 'End') {
                        code += ShapeToCode(next_shape)
                        next_shape = NextShape(next_shape)
                    }

                    if (value === 'Да') code += ShapeToCode({figure: 'ConditionElse'})
                    if (value === 'Нет') code += ShapeToCode({figure: 'ConditionEnd'})
                })

                return next_shape
            } else {
                if (shape.figure === 'Ref') {
                    let second_shape = shapes.filter(item => item.text === shape.text && item.key !== shape.key)
                    if (second_shape.length === 0) throw new Error(`Не найдена вторая ссылка со значением "${shape.text}"`)
                    if (second_shape.length > 1) throw new Error(`Ссылок со значением "${shape.text}" больше двух`)
                    shape = second_shape[0]
                }

                let link = links.filter(item => item.from === shape.key)
                if (link.length === 0) throw new Error('Не обнаружен блок "Конец"')
                if (link.length > 1) throw new Error('Обнаружено несколько путей из блока, не позволяющего ветвление')
                link = link[0]

                shape = shapes.find(item => item.key === link.to)
                if (!shape) throw new Error('Не обнаружен блок "Конец"')

                return shape
            }
        }

        try {
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