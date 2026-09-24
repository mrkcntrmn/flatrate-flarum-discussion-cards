<?php

declare(strict_types=1);

/**
 * Optional bootstrap for local PHPUnit when vendor/ is a foreign symlink
 * without this package's Composer autoload entries. CI uses vendor/autoload.php
 * after `composer update` and does not need this file.
 */

$root = dirname(__DIR__);
$autoload = $root . '/vendor/autoload.php';
if (!is_file($autoload)) {
    fwrite(STDERR, "vendor/autoload.php missing — run composer update\n");
    exit(1);
}

require $autoload;

spl_autoload_register(static function (string $class) use ($root): void {
    $map = [
        'FlatRate\\DiscussionCards\\' => $root . '/src/',
        'FlatRate\\DiscussionCards\\Tests\\' => $root . '/tests/',
    ];
    foreach ($map as $prefix => $base) {
        if (!str_starts_with($class, $prefix)) {
            continue;
        }
        $relative = substr($class, strlen($prefix));
        $path = $base . str_replace('\\', '/', $relative) . '.php';
        if (is_file($path)) {
            require $path;
        }
        return;
    }
});
