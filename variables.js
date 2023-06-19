$(() => {


    $('.var').click(function() {
        $('.variables-container').toggleClass('active');
        $('.var').toggleClass('active');
    });


    $(document).on('click', '.add-variable', function () {
        $(this).before(`
            <div class="variable-row">
                <label class="variable-label">
                    <input placeholder="Имя переменной" class="variable-name variable-input">
                </label>
                <label class="variable-label">
                    <input placeholder="Тип переменной" class="variable-type variable-input">
                </label>
                <button class="remove-variable"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V8H21V6H17V4C17 3.46957 16.7893 2.96086 16.4142 2.58579C16.0391 2.21071 15.5304 2 15 2H9C8.46957 2 7.96086 2.21071 7.58579 2.58579C7.21071 2.96086 7 3.46957 7 4V6H3V8H5V20ZM9 4H15V6H9V4ZM8 8H17V20H7V8H8Z"/>
<path d="M9 10H11V18H9V10ZM13 10H15V18H13V10Z"/>
</svg></button>
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