<?php

declare(strict_types=1);

$dbPath = __DIR__ . DIRECTORY_SEPARATOR . 'data.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$pdo->exec("
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT
  );
");

$pdo->exec("
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
");

$pdo->exec("
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    address TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Ativo',
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );
");

$pdo->exec("
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
");

$menuCount = (int) $pdo->query("SELECT COUNT(*) FROM menu_items")->fetchColumn();
if ($menuCount === 0) {
  $defaults = ['Marmita Tradicional', 'Marmita Fitness', 'Frango Grelhado', 'Carne de Sol'];
  $stmt = $pdo->prepare("INSERT INTO menu_items (name) VALUES (:name)");
  foreach ($defaults as $item) {
    $stmt->execute([':name' => $item]);
  }
}

function json_response($data, int $status = 200): void
{
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

