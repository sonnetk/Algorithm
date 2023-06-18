<?php
$code = $_REQUEST['code'];
$input = $_REQUEST['input'];

if (!is_dir('temp')) {
    mkdir('temp');
}

file_put_contents('temp\program.pas', $code);
file_put_contents('temp\input.txt', $input);

if (stripos(php_uname(), 'win') !== false) {
    shell_exec('chcp 65001');
    $compilation_output = shell_exec('fpc .\temp\program.pas');
    $execution_output = shell_exec('type .\temp\input.txt | .\temp\program');
} else {
    $compilation_output = shell_exec('fpc .\temp\program.pas');
    $execution_output = shell_exec('cat .\temp\input.txt | .\temp\program');
}

$json = [
    'compilation_output' => nl2br($compilation_output),
    'execution_output' => nl2br($execution_output),
];

echo json_encode($json, JSON_UNESCAPED_UNICODE);