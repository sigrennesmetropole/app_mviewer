<?php
header('Content-Type: application/json; charset=utf-8');
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/phpmailer/src/Exception.php';
require_once __DIR__ . '/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/phpmailer/src/SMTP.php';

setlocale(LC_TIME, 'fr_FR.utf8','fra'); 
$data_post = file_get_contents("php://input");
$data = json_decode($data_post, true);
$uid = $data['fichiers']['uid'];

$mail = new PHPMailer(true);
$mail->SMTPDebug = 0;
$mail->CharSet = 'UTF-8';
$mail->isSMTP();
$mail->Host = 'localhost';
$mail->Port = 1025;
$mail->From = "balades-noreply@rennesmetropole.fr";
$mail->FromName = "Balades Mviewer";

$mail->AddStringAttachment(json_encode($data['fichiers']['param_'.$uid.'.json'], JSON_UNESCAPED_UNICODE), 'param_'.$uid.'.json');
$mail->AddStringAttachment(json_encode($data['fichiers']['points_'.$uid.'.geojson'], JSON_UNESCAPED_UNICODE), 'points_'.$uid.'.geojson');
$mail->AddStringAttachment(json_encode($data['fichiers']['balades_'.$uid.'.geojson'], JSON_UNESCAPED_UNICODE), 'balades_'.$uid.'.geojson');
$mail->AddStringAttachment($data['fichiers']['balades_'.$uid.'.xml'], 'balades_'.$uid.'.xml');

$mail->addAddress("sigsupport@mutu.local");
$mail->isHTML(true);
$mail->Subject = "Nouvelle création d'une balade";
$mail->Body = "<style>
                table, th, td {
                    border: 1px solid black;
                    border-collapse: collapse;
                    max-width: 800px;
                }
                th, td {
                    padding: 5px;
                    text-align: left;
                    min-width: 150px;
                }
              </style>
              <b>Demande de création d'une nouvelle balade</b><br><br>
              Informations de la demande de création de la balade :<br><br>
              <table>
                <tr>
                    <th>Titre de la balade</th>
                    <td>".$data['titre']."</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>".utf8_encode(strftime('%A %d %B %Y'))." à ".utf8_encode(strftime('%H:%M:%S'))."</td>
                </tr>
                <tr>
                    <th>Nom</th>
                    <td>".$data['nom']."</td>
                </tr>
                <tr>
                    <th>Mail</th>
                    <td>".$data['mail']."</td>
                </tr>
                <tr>
                    <th>Commentaire</th>
                    <td>".$data['commentaire']."</td>
                </tr>
              </table><br>

              Les fichiers ci-joints à mettre sur le serveur <b>MViewer</b> sont : 
              <ul>
                    <li><b>balades_".$uid.".xml</b> à déposer au sein du dossier <i>balades</i></li>
                    <li><b>points_".$uid.".geojson</b> à déposer au sein du dossier <i>balades/customlayer/data</i></li>
                    <li><b>balades_".$uid.".geojson</b> à déposer au sein du dossier <i>balades/customlayer/data</i></li>
                    <li><b>param_".$uid.".json</b> à déposer au sein du dossier <i>balades/parametrage</i></li>
              </ul><br>

              Cordialement,<br>
              Le formulaire de balades.<br><br>
              <i>Ce courriel a été envoyé automatiquement, merci de ne pas y répondre</i>
              ";

try {
    $mail->send();
    echo "Message has been sent successfully";
} catch (Exception $e) {
    echo "Mailer Error: " . $mail->ErrorInfo;
}
?>