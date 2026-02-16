<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? '';

switch ($action) {
  case 'companies': {
    $rows = $pdo->query("SELECT id, name, phone FROM companies ORDER BY name ASC")->fetchAll();
    json_response($rows);
  }

  case 'menu_today': {
    $rows = $pdo->query("SELECT id, name FROM menu_items ORDER BY id DESC")->fetchAll();
    json_response($rows);
  }

  case 'add_company': {
    $name = trim($_POST['name'] ?? '');
    if ($name === '') {
      json_response(['error' => 'Nome obrigatório'], 400);
    }
    $phone = trim($_POST['phone'] ?? '');
    $stmt = $pdo->prepare("INSERT INTO companies (name, phone) VALUES (:name, :phone)");
    $stmt->execute([':name' => $name, ':phone' => $phone]);
    json_response(['id' => (int) $pdo->lastInsertId(), 'name' => $name, 'phone' => $phone]);
  }

  case 'add_menu_item': {
    $name = trim($_POST['name'] ?? '');
    if ($name === '') {
      json_response(['error' => 'Item obrigatório'], 400);
    }
    $stmt = $pdo->prepare("INSERT INTO menu_items (name) VALUES (:name)");
    $stmt->execute([':name' => $name]);
    json_response(['id' => (int) $pdo->lastInsertId(), 'name' => $name]);
  }

  case 'delete_menu_item': {
    $id = (int) ($_POST['id'] ?? 0);
    if ($id <= 0) {
      json_response(['error' => 'ID inválido'], 400);
    }
    $stmt = $pdo->prepare("DELETE FROM menu_items WHERE id = :id");
    $stmt->execute([':id' => $id]);
    json_response(['ok' => true]);
  }

  case 'create_order': {
    $companyId = (int) ($_POST['company_id'] ?? 0);
    $qty = (int) ($_POST['qty'] ?? 0);
    $address = trim($_POST['address'] ?? '');
    $notes = trim($_POST['notes'] ?? '');
    $items = $_POST['items'] ?? [];

    if ($companyId <= 0 || $qty <= 0) {
      json_response(['error' => 'Empresa e quantidade obrigatórias'], 400);
    }

    $stmt = $pdo->prepare("
      INSERT INTO orders (company_id, qty, address, notes)
      VALUES (:company_id, :qty, :address, :notes)
    ");
    $stmt->execute([
      ':company_id' => $companyId,
      ':qty' => $qty,
      ':address' => $address,
      ':notes' => $notes
    ]);

    $orderId = (int) $pdo->lastInsertId();
    if (is_array($items) && count($items) > 0) {
      $stmtItem = $pdo->prepare("
        INSERT INTO order_items (order_id, name) VALUES (:order_id, :name)
      ");
      foreach ($items as $item) {
        $name = trim((string) $item);
        if ($name === '') {
          continue;
        }
        $stmtItem->execute([':order_id' => $orderId, ':name' => $name]);
      }
    }

    json_response(['id' => $orderId]);
  }

  case 'cancel_order': {
    $id = (int) ($_POST['id'] ?? 0);
    if ($id <= 0) {
      json_response(['error' => 'ID inválido'], 400);
    }
    $stmt = $pdo->prepare("UPDATE orders SET status = 'Cancelado' WHERE id = :id");
    $stmt->execute([':id' => $id]);
    json_response(['ok' => true]);
  }

  case 'orders_today': {
    $orders = $pdo->query("
      SELECT o.id, o.qty, o.address, o.notes, o.status, o.created_at, c.name AS company_name
      FROM orders o
      JOIN companies c ON c.id = o.company_id
      WHERE date(o.created_at) = date('now','localtime')
      ORDER BY o.id DESC
    ")->fetchAll();

    $ids = array_map(fn($row) => (int) $row['id'], $orders);
    $itemsByOrder = [];
    if (count($ids) > 0) {
      $placeholders = implode(',', array_fill(0, count($ids), '?'));
      $stmt = $pdo->prepare("
        SELECT order_id, name
        FROM order_items
        WHERE order_id IN ($placeholders)
        ORDER BY id ASC
      ");
      $stmt->execute($ids);
      foreach ($stmt->fetchAll() as $row) {
        $orderId = (int) $row['order_id'];
        if (!isset($itemsByOrder[$orderId])) {
          $itemsByOrder[$orderId] = [];
        }
        $itemsByOrder[$orderId][] = $row['name'];
      }
    }

    $result = array_map(function ($order) use ($itemsByOrder) {
      $id = (int) $order['id'];
      return [
        'id' => $id,
        'company_name' => $order['company_name'],
        'qty' => (int) $order['qty'],
        'address' => $order['address'] ?? '',
        'notes' => $order['notes'] ?? '',
        'status' => $order['status'] ?? 'Ativo',
        'created_at' => $order['created_at'],
        'items' => $itemsByOrder[$id] ?? []
      ];
    }, $orders);

    json_response($result);
  }

  default:
    json_response(['error' => 'Ação inválida'], 404);
}


