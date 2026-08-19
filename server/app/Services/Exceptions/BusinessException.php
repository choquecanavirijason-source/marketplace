<?php

namespace App\Services\Exceptions;

use RuntimeException;

class BusinessException extends RuntimeException
{
    public function __construct(string $message, public int $statusCode = 422)
    {
        parent::__construct($message);
    }
}