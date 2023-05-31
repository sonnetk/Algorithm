document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toCode').addEventListener('click', () => {
        const model = JSON.parse(myDiagram.model.toJson())
        const shapes = model.nodeDataArray
        const links = model.linkDataArray
        let code = ''

        // try {
            let start = shapes.filter(item => item.figure === 'Start')
            if (start.length === 0) throw new Error('Не найден блок "Начало"')
            if (start.length > 1) throw new Error('Обнаружены несколько блоков "Начало"')
            let shape = start[0]

            CheckCicles(shape)

            while (shape.figure !== 'End') {
                shape = NextShape(shape, true)
            }

            code += ShapeToCode(shape)
            ace.edit('editorCode').setValue(code)

        // } catch (error) {
        //     alert(error.message);
        // }

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
                code += `until ${text}\n`
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

        function NextShape(shape, to_code, to_passed) {
            if (to_passed) shape.passed = true
            if (to_code) code += ShapeToCode(shape)

            if (shape.flag === 'Until') {
                let link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === 'ДА')
                if (link.length === 0) throw new Error(`Не обнаружен путь со значением "Да"`)
                if (link.length > 1) throw new Error(`Обнаружено несколько путей со значением "Да" из одного условия`)
                link = link[0]

                shape = shapes.find(item => item.key === link.to)
                if (!shape) throw new Error('Не обнаружен блок "Конец"')

                return shape
            } else if (shape.flag === 'WhileEnd') {
                let link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === 'НЕТ')
                if (link.length === 0) throw new Error(`Не обнаружен путь со значением "Нет"`)
                if (link.length > 1) throw new Error(`Обнаружено несколько путей со значением "Нет" из одного условия`)
                link = link[0]

                shape = shapes.find(item => item.key === link.to)
                if (!shape) throw new Error('Не обнаружен блок "Конец"')

                return shape
            } else if (shape.figure === 'Сondition') {
                let next_shape
                let closure_info
                const values = ['Да', 'Нет']

                if (to_code) {
                    closure_info = GetClosureInfo(shape)
                } else {
                    closure_info = {shape: shapes.find(item => item.figure === 'End')}
                }

                values.forEach(value => {
                    let link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === value.toUpperCase())
                    if (link.length === 0) throw new Error(`Не обнаружен путь со значением "${value}"`)
                    if (link.length > 1) throw new Error(`Обнаружено несколько путей со значением "${value}" из одного условия`)
                    link = link[0]

                    next_shape = shapes.find(item => item.key === link.to)
                    if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

                    if (to_code && value === 'Нет' && closure_info.false_shapes_count > 0) {
                        code = code.slice(0, code.lastIndexOf(';')) + code.slice(code.lastIndexOf(';') + 1)
                        code += 'else\n'
                    }
                    if ((to_code && value === 'Да' && closure_info.true_shapes_count !== 1) ||
                        (to_code && value === 'Нет' && closure_info.false_shapes_count > 1))
                        code += 'begin\n'

                    while (next_shape !== closure_info.shape && (!to_passed || !shape.passed)) {
                        next_shape = NextShape(next_shape, to_code, to_passed)
                    }

                    if ((to_code && value === 'Да' && closure_info.true_shapes_count !== 1) ||
                        (to_code && value === 'Нет' && closure_info.false_shapes_count > 1))
                        code += 'end;\n'
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

        function GetClosureInfo(shape) {
            let next_shape
            const true_shapes = []
            const false_shapes = []
            const values = ['Да', 'Нет']

            values.forEach(value => {
                let link = links.filter(item => item.from === shape.key && item.text?.toUpperCase() === value.toUpperCase())
                if (link.length === 0) throw new Error(`Не обнаружен путь со значением "${value}"`)
                if (link.length > 1) throw new Error(`Обнаружено несколько путей со значением "${value}" из одного условия`)
                link = link[0]

                next_shape = shapes.find(item => item.key === link.to)
                if (!next_shape) throw new Error('Не обнаружен блок "Конец"')

                while (next_shape.figure !== 'End' && !true_shapes.includes(next_shape.key) && !false_shapes.includes(next_shape.key)) {
                    if (value === 'Да') true_shapes.push(next_shape.key)
                    if (value === 'Нет') false_shapes.push(next_shape.key)
                    next_shape = NextShape(next_shape, false, true)
                }
                true_shapes.push(next_shape.key)
                false_shapes.push(next_shape.key)
            })

            return {
                shape: next_shape,
                true_shapes_count: true_shapes.indexOf(next_shape.key),
                false_shapes_count: false_shapes.indexOf(next_shape.key),
            }
        }

        function CheckCicles(shape) {
            while (shape.figure !== 'End' && !shape.passed) {
                const next_shape = NextShape(shape, false, true)

                if (next_shape.passed) {
                    const link = links.find(item => item.from === shape.key && item.to === next_shape.key)

                    if (shape.figure === 'Сondition' && link.text.toUpperCase() === 'НЕТ') {
                        next_shape.flag = 'Repeat'
                        shape.flag = 'Until'
                    } else if (next_shape.figure === 'Сondition') {
                        next_shape.flag = 'While'
                        shape.flag = 'WhileEnd'
                    } else {
                        throw new Error('Обнаружен неопределённый цикл')
                    }
                }

                shape = next_shape
            }
        }
    })
})