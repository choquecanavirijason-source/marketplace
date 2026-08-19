<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$_SERVER = array_merge($_SERVER, [
    'REQUEST_METHOD' => 'POST',
    'REQUEST_URI' => '/api/v1/login',
    'HTTP_HOST' => '127.0.0.1:8000',
    'SERVER_NAME' => '127.0.0.1',
    'SERVER_PORT' => 8000,
    'HTTP_CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json',
    'REMOTE_ADDR' => '127.0.0.1',
    'REMOTE_PORT' => 50000,
    'SCRIPT_FILENAME' => __DIR__ . '/public/index.php',
]);

$request = Illuminate\Http\Request::capture();
$request->initialize(
    $request->query->all(),
    $request->request->all(),
    $request->attributes->all(),
    $request->cookies->all(),
    $request->files->all(),
    $request->server->all(),
    json_encode(['email' => 'cliente@ferromax.com', 'password' => 'password'])
);

$response = $kernel->handle($request);
echo 'STATUS: ' . $response->getStatusCode() . PHP_EOL;
echo 'LOCATION: ' . $response->headers->get('Location') . PHP_EOL;
echo 'BODY: ' . substr($response->getContent(), 0, 300) . PHP_EOL;