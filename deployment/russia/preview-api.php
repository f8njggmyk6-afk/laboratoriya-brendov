<?php
// Preview only: no customer data is stored or relayed to the old backend.
http_response_code(503);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, no-store');
header('X-Robots-Tag: noindex, nofollow');
echo json_encode(['ok' => false, 'error' => 'Тестовая копия: приём заказов и административные операции ещё не подключены.'], JSON_UNESCAPED_UNICODE);
