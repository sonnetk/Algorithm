document.addEventListener('DOMContentLoaded', function () {
    const executeCodeBtn = document.querySelector('.editor__run');
    const resetCodeBtn = document.querySelector('.editor__reset');

// Setup Ace
    let codeEditor = ace.edit("editorCode");
    codeEditor.getSession().setUseWorker(false);


    let editorLib = {
        init() {
            // Configure Ace
            codeEditor.getSession().setUseWrapMode(true);
            codeEditor.getSession().setWrapLimitRange(null, null);

            // Theme
            codeEditor.setTheme("ace/theme/eclipse");

            // Set language
            codeEditor.session.setMode("ace/mode/pascal");

            // Set Options
            codeEditor.setOptions({
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


}, false);