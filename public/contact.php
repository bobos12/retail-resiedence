<?php
// Visit requests from the contact form (/en/contact, /ar/contact).
// Validates the fields again, ignores bots (honeypot) and emails the sales team.
// Change the addresses below if enquiries should go elsewhere.

$TO   = 'sales@retalresidence.com';
$FROM = 'website@retalresidence.com';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$get = function ($key, $max) {
    $v = isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
    return mb_substr($v, 0, $max);
};

// Honeypot: people never see this field; bots fill it in. Answer as if it worked.
if ($get('company', 200) !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$residences = [
    'any' => 'Not decided yet',
    'one-bedroom-apartment' => 'One-Bedroom Apartment',
    'two-bedroom-apartment' => 'Two-Bedroom Apartment',
    'three-bedroom-apartment' => 'Three-Bedroom Apartment',
    'two-bedroom-town-villa' => 'Two-Bedroom Town Villa',
    'three-bedroom-town-villa' => 'Three-Bedroom Town Villa',
    'three-bedroom-executive-villa' => 'Three-Bedroom Executive Villa',
    'four-bedroom-executive-villa' => 'Four-Bedroom Executive Villa',
];

$name      = $get('name', 120);
$phone     = $get('phone', 30);
$email     = $get('email', 200);
$residence = $get('residence', 60) ?: 'any';
$date      = $get('date', 10);
$message   = $get('message', 2000);
$locale    = $get('locale', 2) === 'ar' ? 'Arabic' : 'English';

$invalid = [];
if (mb_strlen($name) < 2) $invalid[] = 'name';
if (!preg_match('/^\+?[\d\s()-]{7,20}$/', $phone) || strlen(preg_replace('/\D/', '', $phone)) < 8) $invalid[] = 'phone';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $invalid[] = 'email';
if (!isset($residences[$residence])) $invalid[] = 'residence';
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || $date < date('Y-m-d', strtotime('-1 day'))) $invalid[] = 'date';

if ($invalid) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'fields' => $invalid]);
    exit;
}

// Strip line breaks from anything that goes into a header.
$clean = function ($v) { return str_replace(["\r", "\n"], ' ', $v); };

$subject = '=?UTF-8?B?' . base64_encode('Visit request: ' . $clean($name) . ', ' . $date) . '?=';
$body = implode("\n", [
    'Name: ' . $name,
    'Phone: ' . $phone,
    'Email: ' . $email,
    'Residence: ' . $residences[$residence],
    'Preferred date: ' . $date,
    'Language: ' . $locale,
    '',
    $message !== '' ? $message : '(no message)',
]);
$headers = implode("\r\n", [
    'From: Retal Residence website <' . $FROM . '>',
    'Reply-To: ' . $clean($email),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = @mail($TO, $subject, $body, $headers, '-f' . $FROM);

if (!$sent) http_response_code(500);
echo json_encode(['ok' => (bool) $sent]);
