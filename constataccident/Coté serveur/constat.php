<?php

require('fpdf.php');

require 'PHPMailerAutoload.php';

ini_set("SMTP","smtp.damien-roelens.be" );
ini_set("smtp_port","587" );

$data = $_POST["data"];
$mailto = $_POST["email"];

$pdf = new FPDF('P','pt','A4');
$pdf->AddPage();
$pdf->AddFont('Arial','','arial.php');
$pdf->SetFont('Arial','',12);
$pdf->Image('constat.jpg', 0, 0,-300); 

$pdf->Image($data,140,530,-300,0,'PNG');



$name = "Damien ROELENS"; 
$pdf->Text(70, 160, $name);

$constat = $pdf->Output('','S');

//Create a new PHPMailer instance
$mail = new PHPMailer();
//Set who the message is to be sent from
$mail->setFrom('constat@damien-roelens.be', 'Constat d\'accident');
//Set who the message is to be sent to
$mail->addAddress($mailto, 'Damien Roelens');
//Set the subject line
$mail->Subject = 'Votre constat d\'accident en PDF';

//Replace the plain text body with one created manually
$mail->Body = 'This is a plain-text message body';
//Attach an image file
$mail->addStringAttachment($constat,'constat.pdf');


//send the message, check for errors
if (!$mail->send()) {
	http_response_code(404);
} else {
	http_response_code(200);
}

?>
