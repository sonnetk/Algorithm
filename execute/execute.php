<?php
$code = $_REQUEST['code'];
$input = $_REQUEST['input'];

if (!is_dir('temp')) {
    mkdir('temp');
}

file_put_contents('temp\program.pas', $code);
file_put_contents('temp\input.txt', $input);

shell_exec('chcp 65001');
$output = shell_exec('fpc .\temp\program.pas > .\temp\program.log && type .\temp\input.txt | .\temp\program');
echo nl2br($output);