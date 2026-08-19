<?php

namespace App\Exceptions;

class InsufficientStockException extends DomainException
{
    public static function forProduct(string $productName): self
    {
        return new self("No hay stock suficiente de \"{$productName}\".");
    }

    public function status(): int
    {
        return 409;
    }
}
