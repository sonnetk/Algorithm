document.addEventListener('DOMContentLoaded', function () {
const executeCodeBtn = document.querySelector('.editor__run');
const resetCodeBtn = document.querySelector('.editor__reset');
const editorCode = document.querySelector('.editorCode');

// Setup Ace
let codeEditor = ace.edit(editorCode);
let defaultCode = 'console.log("Hello World!")';

let editorLib = {
    init() {
        // Configure Ace

        // Set language
        codeEditor.session.setMode("ace/mode/pascal");

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
}, false);