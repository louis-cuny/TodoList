<?php
require_once '../vendor/autoload.php';// Autoload our dependencies with Composer

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

$app = new \Slim\App();
$app->add(function(ServerRequestInterface $request, ResponseInterface $response, callable $next){
	$response = $response->withHeader('Content-type', 'application/json; charset=utf-8');
	$response = $response->withHeader('Access-Control-Allow-Origin', '*');
	$response = $response->withHeader('Access-Control-Allow-Methods', 'OPTION, GET, POST, PUT, PATCH, DELETE');
	return $next($request, $response);
});

//Chemins des fichiers JSON
$products_path = realpath('..').'/products.json';
$cart_path = realpath('..').'/cart.json';

//On charge les produits existants
$products = array();
if(file_exists($products_path)){
	$products = json_decode(file_get_contents($products_path), true);
}

$app->get('/products', function() use($products){
	echo json_encode($products);
});

$app->group('/cart', function() use($app, $products, $cart_path){
	$app->post('/{pid}', function(Slim\Http\Request $request, Slim\Http\Response $response) use($products, $cart_path){
		$pid = $request->getAttribute('pid');
		if(!empty($pid) && isset($products[$pid])){
			$current = array();
			if(file_exists($cart_path)){
				$current = json_decode(file_get_contents($cart_path), true);
			}
			if( ! isset($current[$pid]) ){
				$current[$pid]['nom'] = $products[$pid]['nom'];
				$current[$pid]['qte'] = 0;
				$current[$pid]['prix'] = 0;
			}

			$current[$pid]['qte'] += 1;
			$current[$pid]['prix'] = $current[$pid]['qte'] * $products[$pid]['prix'];

			$to_json = json_encode($current);
			file_put_contents($cart_path, $to_json);
			echo $to_json;
		}
	});

	$app->get('', function() use($cart_path){
		$cart = json_encode(array());
		if(file_exists($cart_path)){
			$cart = file_get_contents($cart_path);
		}
		echo $cart;
	});

	$app->delete('', function() use($cart_path){
		if(file_exists($cart_path)){
			file_put_contents($cart_path, '');
		}
		echo json_encode(array('success' => 1));
	});

	$app->put('/{pid}/buy', function(Slim\Http\Request $request, Slim\Http\Response $response){
		$pid = $request->getAttribute('pid');
		sleep(rand(0,5));
		echo json_encode(array('success' => 1, 'product' => $pid));
	});
});

$app->run();
