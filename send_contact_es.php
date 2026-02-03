<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $subject = strip_tags(trim($_POST["subject"]));
    $message = trim($_POST["message"]);

    if (empty($name) || empty($subject) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: contact_es.html?status=error&msg=invalid");
        exit;
    }

    $recipient = "info@alaive.de";
    $email_subject = "Nuevo contacto de ALAIVE: $subject";
    $email_content = "Nombre: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Mensaje:\n$message\n";

    $email_headers = "From: $name <$email>";

    if (mail($recipient, $email_subject, $email_content, $email_headers)) {
        header("Location: contact_es.html?status=success");
    } else {
        header("Location: contact_es.html?status=error&msg=send_failed");
    }
} else {
    header("Location: contact_es.html");
}
?>