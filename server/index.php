<?php
require_once './vendor/autoload.php';// Autoload our dependencies with Composer

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

$app = new \Slim\App();
$app->add(function (ServerRequestInterface $request, ResponseInterface $response, callable $next) {
    $response = $response->withHeader('Content-type', 'application/json; charset=utf-8');
    $response = $response->withHeader('Access-Control-Allow-Origin', '*');
    $response = $response->withHeader('Access-Control-Allow-Methods', 'OPTION, GET, POST, PUT, PATCH, DELETE');
    return $next($request, $response);
});

//On charge les tasks
$tasks = json_decode(file_get_contents('tasks.json'), true);


$app->group('/tasks', function () use ($app, $tasks) {
    $app->get('', function () use ($tasks) {
        echo json_encode($tasks);
    });
    $app->post('', function (ServerRequestInterface $request) use ($tasks) {
        $id = bin2hex(random_bytes(4));
        $tasks[$id]['name'] = $request->getParam('name');
        $tasks[$id]['duration'] = $request->getParam('duration');
        $tasks[$id]['tags'] = [];
        /*foreach ($request->getParam('tags') as $tag) {
            $tasks[$id]['tags'][$tag] = $tag;
        }*/
        file_put_contents('tasks.json', json_encode($tasks));
        echo json_encode(array('success' => 1));
    });

    $app->post('/{taskid}/tags', function (ServerRequestInterface $request) use ($tasks) {
        $tasks[$request->getAttribute('taskid')]['tags'][$request->getParam('tag_name')] = $request->getParam('tag_name');
        file_put_contents('tasks.json', json_encode($tasks));
        echo json_encode(array('success' => 1));
    });

    $app->delete('', function () {
        file_put_contents('tasks.json', '');
        echo json_encode(array('success' => 1));
    });

    $app->delete('/{taskid}', function (ServerRequestInterface $request) use ($tasks) {
        if ($tasks[$request->getAttribute('taskid')]) {
            unset($tasks[$request->getAttribute('taskid')]);
            file_put_contents('tasks.json', json_encode($tasks));
            echo json_encode(array('success' => 1));
        }
    });

    $app->delete('/{taskid}/tags/{tagid}', function (ServerRequestInterface $request) use ($tasks) {
        if (($task = $tasks[$request->getAttribute('taskid')]) && $task['tags'][$request->getAttribute('tagid')]) {
            unset($tasks[$request->getAttribute('taskid')]['tags'][$request->getAttribute('tagid')]);
            file_put_contents('tasks.json', json_encode($tasks));
            echo json_encode(array('success' => 1));
        }
    });
});

$app->run();
