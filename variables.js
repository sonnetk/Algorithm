$(() => {

    $('.variables-container').hover(function(){
            $('.add-variable').css('display','block');
            $('.variable-row').css('display','flex');
            $('.variables-container').css('background-color','white');
            $('.var').css('display','none');
        },
        function(){
            $('.add-variable, .variable-row').css('display','none');
            $('.variables-container').css('background-color','transparent');
            $('.var').css('display','block');
        });



    $(document).on('click', '.add-variable', function () {
        $(this).before(`
            <div class="variable-row">
                <label class="variable-label">
                    Имя переменной
                    <input class="variable-name variable-input">
                </label>
                <label class="variable-label">
                    Тип переменной
                    <input class="variable-type variable-input">
                </label>
                <button class="remove-variable">-</button>
            </div>
        `)

        $('.variable-type').autocomplete({
            source: ['integer', 'real', 'double', 'boolean', 'char']
        })
    })

    $(document).on('click', '.remove-variable', function () {
        $(this).parent().remove()
    })

})