document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray
        let code = ''

        try {
        let start = shapes.filter(item => item.figure === 'Start')
        if (start.length === 0) throw new Error('Не найден блок "Начало"')
        if (start.length > 1) throw new Error('Обнаружены несколько блоков "Начало"')
        let shape = start[0]

        CheckLoops(shape)

        Translate(shape)

        ace.edit('editorCode').setValue(code)

        } catch (error) {
            alert(error.message);
        }

        function ShapeToCode(shape) {
            let code = ''

            if (shape.flag === 'Repeat') {
                code += 'repeat\n'
            }

            if (shape.figure === 'Start') {
                code += 'begin\n'
            } else if (shape.figure === 'Action') {
                const text = shape.text
                    .replace('=', ':=')
                    .replace('::=', ':=')
                    .replace(';', '')
                    .replace('\n', ';\n')
                code += `${text};\n`
            } else if (shape.figure === 'Input') {
                code += `readln(${shape.text});\n`
            } else if (shape.figure === 'Output') {
                code += `writeln(${shape.text});\n`
            } else if (shape.figure === 'LoopStart') {
                const text = shape.text
                    .replace('=', ':=')
                    .replace('::=', ':=')
                    .replace(',', ' to')
                code += `for ${text} do\nbegin\n`
            } else if (shape.figure === 'LoopEnd') {
                code += `end;\n`
            } else if (shape.flag === 'While') {
                const text = shape.text
                    .replace(' и ', ' and ')
                    .replace(' или ', ' or ')
                code += `while ${text} do\nbegin\n`
            } else if (shape.flag === 'Until') {
                const text = shape.text
                    .replace(' и ', ' and ')
                    .replace(' или ', ' or ')
                code += `until ${text};\n`
            } else if (shape.figure === 'Сondition') {
                const text = shape.text
                    .replace(' и ', ' and ')
                    .replace(' или ', ' or ')
                code += `if ${text} then\n`
            } else if (shape.figure === 'End') {
                code += `end.`
            }

            if (shape.flag === 'WhileEnd') {
                code += 'end;\n'
            }

            return code
        }

        function CheckLoops(shape) {
            while (shape.figure !== 'End' && !shape.visited) {
                const next_shape = NextShape(shape, 'check loops')

                if (next_shape.visited && next_shape.flag !== 'Until') {
                    throw new Error('Обнаружен неопределённый цикл')
                }

                shape = next_shape
            }
        }

        function Translate(shape) {
            while (shape.figure !== 'End') {
                shape = NextShape(shape, 'to code')
            }
            code += ShapeToCode(shape)
        }

        function NextShape(shape, mode) {
            let next_shape

            if (mode === 'check loops') shape.visited = true
            if (mode === 'to code') code += ShapeToCode(shape)

            if (shape.flag === 'Until') {
                let link = links.find(item => item.from === shape.key && item.text?.toUpperCase() === 'ДА')
                next_shape = shapes.find(item => item.key === link.to)

                return next_shape

            } else if (shape.flag === 'WhileEnd') {
                let link = links.find(item => item.from === shape.key)
                next_shape = shapes.find(item => item.key === link.to)

                link = links.find(item => item.from === next_shape.key && item.text?.toUpperCase() === 'НЕТ')
                next_shape = shapes.find(item => item.key === link.to)

                return next_shape

            } else if (shape.figure === 'Сondition') {
                const closure_info = GetClosureInfo(shape)

                let true_link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === 'ДА')
                if (true_link.length === 0) throw new Error('Не обнаружен путь со значением "Да"')
                if (true_link.length > 1) throw new Error('Обнаружено несколько путей со значением "Да" из одного условия')
                true_link = true_link[0]

                next_shape = shapes.find(item => item.key === true_link.to)
                if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

                if (mode === 'to code' && closure_info.true_shapes_count !== 1) code += 'begin\n'

                while (next_shape !== closure_info.shape && next_shape.figure !== 'End') {
                    next_shape = NextShape(next_shape, mode)
                }

                if (mode === 'to code' && closure_info.true_shapes_count !== 1) code += 'end;\n'

                let false_link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === 'НЕТ')
                if (false_link.length === 0) throw new Error('Не обнаружен путь со значением "Нет"')
                if (false_link.length > 1) throw new Error('Обнаружено несколько путей со значением "Нет" из одного условия')
                false_link = false_link[0]

                next_shape = shapes.find(item => item.key === false_link.to)
                if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

                if (mode === 'to code' && closure_info.false_shapes_count > 0) {
                    code = code.slice(0, code.lastIndexOf(';')) + code.slice(code.lastIndexOf(';') + 1)
                    code += 'else\n'
                    if (closure_info.false_shapes_count > 1) code += 'begin\n'
                }

                while (next_shape !== closure_info.shape && next_shape.figure !== 'End') {
                    next_shape = NextShape(next_shape, mode)
                }

                if (mode === 'to code' && closure_info.false_shapes_count > 1) code += 'end;\n'

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

                next_shape = shapes.find(item => item.key === link.to)
                if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

                return next_shape
            }
        }

        function GetClosureInfo(shape) {
            let next_shape
            const true_shapes = []
            const false_shapes = []

            let true_link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === 'ДА')
            if (true_link.length === 0) throw new Error('Не обнаружен путь со значением "Да"')
            if (true_link.length > 1) throw new Error('Обнаружено несколько путей со значением "Да" из одного условия')
            true_link = true_link[0]

            next_shape = shapes.find(item => item.key === true_link.to)
            if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

            while (next_shape.figure !== 'End' && !true_shapes.includes(next_shape) && next_shape !== shape) {
                true_shapes.push(next_shape)
                next_shape = NextShape(next_shape, 'get closure')
            }
            true_shapes.push(next_shape)

            if (next_shape === shape) {
                const prev_shape = true_shapes[true_shapes.length - 2]

                shape.flag = 'While'
                prev_shape.flag = 'WhileEnd'
            }

            let false_link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === 'НЕТ')
            if (false_link.length === 0) throw new Error('Не обнаружен путь со значением "Нет"')
            if (false_link.length > 1) throw new Error('Обнаружено несколько путей со значением "Нет" из одного условия')
            false_link = false_link[0]

            next_shape = shapes.find(item => item.key === false_link.to)
            if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

            while (next_shape.figure !== 'End' && !true_shapes.includes(next_shape) && !false_shapes.includes(next_shape.key) && next_shape !== shape) {
                false_shapes.push(next_shape)
                next_shape = NextShape(next_shape, 'get closure')
            }
            false_shapes.push(next_shape)

            if (next_shape === shape) {
                const next_shape = shapes.find(item => item.key === false_link.to)

                next_shape.flag = 'Repeat'
                shape.flag = 'Until'
            }

            return {
                shape: next_shape,
                true_shapes_count: true_shapes.indexOf(next_shape),
                false_shapes_count: false_shapes.indexOf(next_shape),
            }
        }
    })
})