<?php
header('Content-Type: application/json; charset=utf-8');
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

$data_post = file_get_contents("php://input");
$data = json_decode($data_post, true);
$uid = $data['fichiers']['uid'];

$mail = new PHPMailer(true);
$mail->SMTPDebug = 0;
$mail->CharSet = 'UTF-8';
$mail->isSMTP();
$mail->Host = '10.253.100.1'; # 10.253.100.1
$mail->Port = 25; # 25
$mail->From = "balades-noreply@rennesmetropole.fr";
$mail->FromName = "Balades Mviewer";

$mail->AddStringAttachment(json_encode($data['fichiers']['param_'.$uid.'.json'], JSON_UNESCAPED_UNICODE), 'param_'.$uid.'.json');
$mail->AddStringAttachment(json_encode($data['fichiers']['points_'.$uid.'.geojson'], JSON_UNESCAPED_UNICODE), 'points_'.$uid.'.geojson');
$mail->AddStringAttachment(json_encode($data['fichiers']['balades_'.$uid.'.geojson'], JSON_UNESCAPED_UNICODE), 'balades_'.$uid.'.geojson');
$mail->AddStringAttachment($data['fichiers']['balades_'.$uid.'.xml'], 'balades_'.$uid.'.xml');

$mail->addAddress("sigsupport@rennesmetropole.fr");
$mail->isHTML(true);
$mail->Subject = "Nouvelle demande de création d'une carte balade";
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
              <b>Demande de création d'une nouvelle carte de balade</b><br><br>
              Informations :<br><br>
              <table>
                <tr>
                    <th>Titre de la carte</th>
                    <td>".$data['titre']."</td>
                </tr>
                <tr>
                    <th>Date de la demande</th>
                    <td>".$data['date']."</td>
                </tr>
                <tr>
                    <th>Demandeur</th>
                    <td>".$data['nom']."</td>
                </tr>
                <tr>
                    <th>Mail du demandeur</th>
                    <td>".$data['mail']."</td>
                </tr>
                <tr>
                    <th>Commentaire</th>
                    <td>".$data['commentaire']."</td>
                </tr>
              </table><br>

              Les fichiers ci-joints à déposer sur le serveur <b>MViewer</b> sont (cf. <a href='http://redmine2:8082/issues/11595'>ticket Redmine</a>): 
              <ul>
                    <li><b>balades_".$uid.".xml</b> à déposer dans le dossier <i>apps/balades</i></li>
                    <li><b>points_".$uid.".geojson</b> à déposer dans le dossier <i>apps/balades/customlayer/data</i></li>
                    <li><b>balades_".$uid.".geojson</b> à déposer dans le dossier <i>apps/balades/customlayer/data</i></li>
                    <li><b>param_".$uid.".json</b> à déposer dans le dossier <i>apps/balades/parametrage</i></li>
              </ul><br>
              Une fois en production, la carte sera consultable à l'url suivante : 
              <a href='https://mviewer.sig.rennesmetropole.fr/?config=apps/balades/balades_".$uid.".xml'>
              https://mviewer.sig.rennesmetropole.fr/?config=apps/balades/balades_".$uid.".xml</a>

              <br><br>
              Cordialement,<br>
              <br>
              <i>Ce courriel a été envoyé automatiquement par le formulaire web \"demande de création d'une balade\", merci de ne pas y répondre</i>
              ";

try {
    $mail->send();
    echo "Message has been sent successfully";
} catch (Exception $e) {
    echo "Mailer Error: " . $mail->ErrorInfo;
}
?>