<?php
//print_r($_POST);
	$img = substr($_POST['img'], 22); // data:image/png;base64,
	file_put_contents('sprites.png', base64_decode($img));
	file_put_contents('sprites.css', $_POST['css']);
	
	$of = 'dynamic/' . md5(date('Y-m-d H:i:s')) . '.zip';
	$zip = new ZipArchive();
	$zip->open($of,  ZipArchive::CREATE);
	$zip->addFile("sprites.css");    
	$zip->addFile("sprites.png");    
	$zip->close();
	
	echo $of;
?>