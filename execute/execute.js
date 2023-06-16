$(() => {
    $('.editor__run').click(function () {
        $.ajax({
            url: 'execute/execute.php',
            data: {
                code: ace.edit('editorCode').getValue(),
                input: '',
            },
            success: response => {
                $('.editor__console').html(response)
            },
        })
    })
})