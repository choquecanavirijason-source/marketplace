<?php

namespace App\Exceptions;

class EmptyCartException extends DomainException
{
    public function __construct(string $message = 'Tu carrito está vacío.')
    {
        parent::__construct($message);
    }
}
