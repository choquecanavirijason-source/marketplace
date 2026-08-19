<?php

namespace App\Http\Resources\Faq;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class FaqCollection extends ResourceCollection
{
    
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'records' => $this->resource->total(),
            'total' => $this->resource->total(),
            'currentPage' => $this->resource->currentPage(),
            'pages' => $this->resource->lastPage(),
        ];
    }
}
