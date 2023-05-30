document.addEventListener('DOMContentLoaded', function () {
    const executeCodeBtn = document.querySelector('.editor__run');
    const resetCodeBtn = document.querySelector('.editor__reset');

// Setup Ace
    let codeEditor = ace.edit("editorCode");
    let defaultCode = 'program HelloWorld; \n\n' +
        'begin \n' +
        'writeln(\'Hello World!\' ); \n' +
        'end.';

    let editorLib = {
        init() {
            // Configure Ace

            // Set language
            codeEditor.session.setMode("mode-pascal.js");

            // Set Options
            codeEditor.setOptions({
                fontFamily: 'Inconsolata',
                fontSize: '12pt',
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
            });

            // Set Default Code
            codeEditor.setValue(defaultCode);
        }
    }

// Events
    executeCodeBtn.addEventListener('click', () => {
        // Get input from the code editor
        const userCode = codeEditor.getValue();

        // Run the user code
        try {
            new Function(userCode)();
        } catch (err) {
            console.error(err);
        }
    });

    resetCodeBtn.addEventListener('click', () => {
        // Clear ace editor
        codeEditor.setValue(defaultCode);
    })

    editorLib.init();

}, false);