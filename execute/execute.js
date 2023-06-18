$(() => {
    $('.editor__run').click(function () {
        $.ajax({
            url: 'execute/execute.php',
            data: {
                code: ace.edit('editorCode').getValue(),
                input: $('#editor-input').val(),
            },
            dataType: 'JSON',
            success: response => {
                $('.editor__console').html(`
                    <span class="compilation_output">${response['compilation_output']}</span>
                    <span class="execution_output">${response['execution_output']}</span>
                `)
            },
        })
    })
})