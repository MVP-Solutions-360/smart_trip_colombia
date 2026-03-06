# 🔧 COMPONENTES LIVEWIRE DETALLADOS

## 1. SearchShow.php - Búsqueda de Vuelos

### Propiedades principales:
```php
public $searchDeparture, $searchArrival;  // Búsqueda de aeropuertos
public $hourDeparture, $hourArrival;      // Fechas de viaje
public $departure, $arrival;              // Códigos IATA seleccionados
public $adult = 1, $child = 0, $baby = 0, $seat = 0;  // Pasajeros
public $roundtrip = 0;                    // Tipo de vuelo
public $flights = [];                     // Resultados de búsqueda
public $field = [];                       // Aeropuertos encontrados
```

### Métodos principales:

#### updatedSearchDeparture()
```php
public function updatedSearchDeparture()
{
    $this->openDep = true;
    $this->fetchAirports($this->searchDeparture);
}
```

#### fetchAirports()
```php
private function fetchAirports($code)
{
    if (strlen($code) >= 3) {
        $response = Http::post(env('APP_TRAVEL')."/api/airports", [
            'code' => $code
        ])->json();
        $this->field = $response;
    } else {
        $this->field = [];
    }
}
```

#### selectDeparture() / selectArrival()
```php
public function selectDeparture($iata, $city, $name)
{
    $this->searchDeparture = $city . " | " . $name;
    $this->departure = $iata;
    $this->openDep = false;
}

public function selectArrival($iata, $city, $name)
{
    $this->searchArrival = $city . " | " . $name;
    $this->arrival = $iata;
    $this->openArr = false;
}
```

#### save() - Enviar búsqueda
```php
public function save()
{
    $this->validate();

    $qty = $this->adult + $this->seat + $this->child;
    
    if ($this->roundtrip == 0) {
        // Vuelo solo ida
        $this->passenger = [
            "searchs" => 250,
            "qtyPassengers" => $qty,
            "adult" => $this->adult,
            "baby" => $this->baby,
            "seat" => $this->seat,
            "child" => $this->child,
            "itinerary" => [
                [
                    "departureCity" => $this->departure,
                    "arrivalCity" => $this->arrival,
                    "hour" => $this->hourDeparture . "T00:00:00+0000"
                ]
            ]
        ];
    } else {
        // Vuelo ida y vuelta
        $this->passenger = [
            "searchs" => 250,
            "qtyPassengers" => $qty,
            "adult" => $this->adult,
            "baby" => $this->baby,
            "seat" => $this->seat,
            "child" => $this->child,
            "itinerary" => [
                [
                    "departureCity" => $this->departure,
                    "arrivalCity" => $this->arrival,
                    "hour" => $this->hourDeparture . "T00:00:00+0000"
                ],
                [
                    "departureCity" => $this->arrival,
                    "arrivalCity" => $this->departure,
                    "hour" => $this->hourArrival . "T00:00:00+0000"
                ]
            ]
        ];
    }

    $response = Http::post(env('APP_TRAVEL').'/api/flights', $this->passenger)->collect();
    Cache::put('flightResponse', [
        'response' => $response, 
        'flights' => $flights, 
        'passenger' => $this->passenger
    ]);
    
    to_route("flights.response");
}
```

### Validaciones:
```php
protected $rules = [
    'adult' => 'required',
    'departure' => 'required',
    'arrival' => 'required',
    'hourDeparture' => 'required',
    'hourArrival' => 'required_if:roundtrip,1'
];

protected $messages = [
    'departure.required' => 'Debe escoger un origen',
    'arrival.required' => 'Debe escoger un destino',
];
```

## 2. ShowResponse.php - Mostrar Resultados

### Propiedades principales:
```php
public $flights = [];           // Datos de búsqueda
public $going, $return;         // Vuelos seleccionados
public $families = "flight";    // Familias tarifarias
public $family;                 // Familia seleccionada
public $upsell;                 // Datos de upsell
public $itinerary;              // Itinerarios procesados
public $uniqueAirlines;         // Aerolíneas únicas
public $airline = [];           // Filtro de aerolíneas
```

### Métodos principales:

#### render() - Procesar resultados
```php
public function render()
{
    $cache = Cache::get('flightResponse');
    $response = $cache['response'];
    $this->flights = $cache['flights'];
    $this->passenger = $cache['passenger'];
    
    $itinerary = collect();
    $this->uniqueAirlines = collect();
    
    if (!empty($response["data"]["recommendation"])) {
        foreach ($response["data"]["recommendation"] as $key => $flight) {
            // Procesar detalles de tarifas
            $details = collect();
            foreach ($flight["paxFareProduct"][0]["fare"] as $detailsFare) {
                if (isset($detailsFare["pricingMessage"])) {
                    $details->push([
                        $detailsFare["pricingMessage"]["description"]
                    ]);
                }
            }
            
            // Procesar penalidades
            $penalty = collect();
            foreach ($flight["paxFareProduct"][0]["fare"] as $penalities) {
                if (isset($penalities["monetaryInformation"])) {
                    $penalty->push([
                        $penalities["monetaryInformation"]["monetaryDetail"]
                    ]);
                }
            }
            
            // Procesar pasajeros
            $paxes = collect();
            foreach ($flight["paxFareProduct"] as $pax) {
                $paxes->push([
                    "fare" => $pax["paxFareDetail"]["totalFareAmount"],
                    "tax" => $pax["paxFareDetail"]["totalTaxAmount"],
                    "type" => $pax["paxReference"]["ptc"],
                    "paxes" => isset($pax["paxReference"]["traveller"][0]) ? 
                        count($pax["paxReference"]["traveller"]) : 1,
                ]);
            }
            
            // Procesar segmentos
            $seg = collect(["seg1" => collect()]);
            if (isset($flight["seg"]["Seg2"])) {
                $seg = collect(["seg1" => collect(), "seg2" => collect()]);
            }
            
            // Procesar Seg1 (ida)
            foreach ($flight["seg"]["Seg1"] as $seg1) {
                $number = $seg1["refNumber"];
                foreach ($response["data"]["Seg1"] as $segment) {
                    if ($segment["num"] == $number) {
                        $it = collect();
                        $airlineCode = $segment["segments"][0]['companyId']['marketingCarrier'];
                        $this->uniqueAirlines->push($airlineCode);
                        
                        foreach ($segment["segments"] as $value) {
                            $it->push(collect([
                                "bag" => $flight['bag'][0],
                                "companyGeneral" => $company["company"],
                                "key" => $key,
                                "productDateTime" => collect($value["productDateTime"]),
                                "location" => collect([
                                    "departure" => $value["location"][0]["locationId"],
                                    "arrival" => $value["location"][1]["locationId"],
                                    "departureAto" => $value["location"][0]["locationName"],
                                    "arrivalAto" => $value["location"][1]["locationName"]
                                ]),
                                "companyId" => collect($value["companyId"]),
                                "flightOrtrainNumber" => $value["flightOrtrainNumber"],
                                "companyName" => $value["companyName"],
                                "cabin" => $cabin
                            ]));
                        }
                        $seg["seg1"]->push($it);
                    }
                }
            }
            
            // Procesar Seg2 (vuelta) si existe
            if (isset($flight["seg"]["Seg2"])) {
                foreach ($flight["seg"]["Seg2"] as $seg2) {
                    $number = $seg2["refNumber"];
                    foreach ($response["data"]["Seg2"] as $segment) {
                        if ($segment["num"] == $number) {
                            $it = collect();
                            foreach ($segment["segments"] as $value) {
                                $it->push(collect([
                                    "bag" => $flight['bag'][1],
                                    "companyGeneral" => $company["company"],
                                    "key" => $key,
                                    "productDateTime" => collect($value["productDateTime"]),
                                    "location" => collect([
                                        "departure" => $value["location"][0]["locationId"],
                                        "arrival" => $value["location"][1]["locationId"],
                                        "departureAto" => $value["location"][0]["locationName"],
                                        "arrivalAto" => $value["location"][1]["locationName"]
                                    ]),
                                    "companyId" => collect($value["companyId"]),
                                    "flightOrtrainNumber" => $value["flightOrtrainNumber"],
                                    "companyName" => $value["companyName"],
                                    "cabin" => $cabin2
                                ]));
                            }
                            $seg["seg2"]->push($it);
                        }
                    }
                }
            }
            
            $itinerary->push([
                "itinerary" => $seg, 
                "fares" => collect($fare), 
                "paxes" => $paxes, 
                "details" => $details, 
                "penalty" => $penalty
            ]);
        }
    }
    
    return view('livewire.flight.show-response', compact("itinerary"));
}
```

#### getGoings() - Obtener familias tarifarias
```php
public function getGoings($goings)
{
    $this->validate();
    $segments = [];
    
    // Construir segmentos para upsell
    foreach ($goings["going"] as $key => $going) {
        $count = $key + 1;
        $cabinGoing = $going["cabin"][$key]["productInformation"]["cabinProduct"];
        $segment = [
            "group" => $count,
            "from" => $going["location"]["departure"],
            "to" => $going["location"]["arrival"],
            "company" => $going["companyId"]["marketingCarrier"],
            "flightNumber" => $going["flightOrtrainNumber"],
            "companyName" => $going["companyName"],
            "class" => isset($cabinGoing[0]) ? $cabinGoing[0]["rbd"] : $cabinGoing["rbd"],
            "hour" => $going["productDateTime"]["dateOfDeparture"] . " 00:00:00"
        ];
        $segments[] = $segment;
    }
    
    // Solicitar upsell a Amadeus
    $upsell = [
        "adult" => $this->flights["adult"],
        "child" => $this->flights["child"],
        "baby" => $this->flights["baby"],
        "seat" => $this->flights["seat"],
        "rountrip" => false,
        "fare" => "RP",
        "bag" => false,
        "segments" => $segments
    ];

    $this->upsell = collect(Http::post(env('APP_TRAVEL').'/api/upsell', $upsell)->collect()["families"]);
    
    // Procesar familias tarifarias
    $this->families = collect();
    $countFamilies = [];
    
    foreach ($this->upsell as $sell) {
        $price = 0;
        $priceTaxes = 0;
        $taxes = 0;
        $types = collect();
        
        foreach ($sell as $fares) {
            $types->push([
                "type" => $fares["type"][0]["fareBasisDetails"]["discTktDesignator"],
                "faresTax" => $fares["fares"]["fare"],
                "fares" => $fares["fares"]["whitoutTax"],
                "taxes" => $fares["taxes"],
                "pax" => $fares["pax"]
            ]);
            $price += $fares["fares"]["whitoutTax"] * $fares["pax"];
            $priceTaxes += $fares["fares"]["fare"] * $fares["pax"];
            $taxes += $fares["taxes"] * $fares["pax"];
        }
        
        // Procesar cabinas
        $sellCabins = $sell[0]["cabin"];
        $cabins = collect();
        foreach ($sellCabins as $sellCabin) {
            if (isset($sellCabin["cabinProduct"][0])) {
                foreach ($sellCabin["cabinProduct"] as $cab) {
                    $cabins->push(collect(["cabin" => $cab["rbd"]]));
                }
            } else {
                $cabins->push(collect(["cabin" => $sellCabin["cabinProduct"]["rbd"]]));
            }
        }
        
        // Procesar condiciones de tarifa
        $sellFamilies = $sell[0]["components"][0];
        $families = collect();
        $familyKey = $sellFamilies["details"]["fareInformation"]["discountDetails"]["rateCategory"];
        
        if (isset($sellFamilies["details"]["freeFlowDescription"][0])) {
            $familyName = $sellFamilies["details"]["freeFlowDescription"][0]["freeText"];
        } else {
            $familyName = $sellFamilies["details"]["freeFlowDescription"]["freeText"];
        }
        
        $family = $sellFamilies["details"]["ocFeeInformation"];
        $condition = collect();
        
        foreach ($family as $familyDetails) {
            $type = $familyDetails["feeDescription"]["dataInformation"]["indicator"];
            $rule = $familyDetails["feeFreeFlowDescription"]["freeText"];
            $condition->push(collect(["type" => $type, "condition" => $rule]));
        }
        
        $countFamilies[] = $familyKey;
        $families->push(collect([
            "family" => $familyName, 
            "familyKey" => $familyKey, 
            "rules" => $condition
        ]));
        
        $this->families->push(collect([
            "families" => $families,
            "fares" => $price,
            "fareTaxes" => $priceTaxes,
            "taxes" => $taxes,
            "cabin" => $cabins,
            "type" => $types
        ]));
    }
    
    $this->families;
    $this->value = $goings["going"][0]["key"];
    $this->count = count($this->families) < 3 ? count($this->families) : 3;
}
```

#### save() - Guardar selección de vuelo
```php
public function save($key)
{
    $this->keySubmit = $key;
    $this->validate();
    $this->going = json_decode($this->going, true);
    $this->return = json_decode($this->return, true);
    
    if ($this->going["going"][0]["key"] == $key) {
        if ($this->flights["roundtrip"] == 1 && $this->going["going"][0]["key"] === $this->return[0]["key"]) {
            $this->change = "yes";
            $this->validate();
            Cache::put('keyFligth', [
                "going" => $this->going, 
                "return" => $this->return, 
                'passengers' => $this->passenger
            ]);
            Cache::forget('keyFligthFamily');
        } elseif ($this->flights["roundtrip"] == 0) {
            $this->change = "yes";
            $this->validate();
            Cache::put('keyFligth', [
                "going" => $this->going, 
                'passengers' => $this->passenger
            ]);
            Cache::forget('keyFligthFamily');
        } else {
            $this->reset(["going", "return","families"]);
            $this->validate();
        }
        
        if ($this->ticket) {
            $this->emit("flightQuoteGds");
            $this->reset(["going", "return","families"]);
        } else {
            to_route("flights.pnr");
        }
    } else {
        $this->reset(["going", "return","families"]);
        $this->validate();
    }
}
```

## 3. ShowSegment.php - Formulario de Pasajeros

### Propiedades principales:
```php
public $name = [];              // Nombres de pasajeros
public $lastName = [];          // Apellidos de pasajeros
public $birth;                  // Fechas de nacimiento
public $sex;                    // Género de pasajeros
public $gener;                  // Tipo de pasajero (ADT, CHD, INF)
public $number;                 // Número de documento
public $tel, $email;            // Contacto
public $going, $return, $family; // Datos de vuelo
public $passengers;             // Información de pasajeros
public $control_number;         // Número de control PNR
```

### Métodos principales:

#### savePnr() - Crear PNR
```php
public function savePnr()
{
    // Validar datos de pasajeros
    $this->validate();
    
    // Construir array de pasajeros
    $travellers = [];
    
    foreach ($this->name as $key => $passenger) {
        if (isset($this->gener[$key]["adult"])) {
            $date = Carbon::createFromFormat('Y-m-d', $this->birth[$key]["adult"]);
            $formatted_date = $date->format('dMy');
            
            if (isset($passenger["baby"])) {
                // Pasajero adulto con infante
                $dateBaby = Carbon::createFromFormat('Y-m-d', $this->birth[$key]["baby"]);
                $formatted_dateBaby = $dateBaby->format('dMy');
                $travellers[] = [
                    "number" => $key + 1,
                    "name" => $passenger["adult"],
                    "lastName" => $this->lastName[$key]["adult"],
                    "passengerType" => $this->gener[$key]["adult"],
                    "free" => "----" . strtoupper($formatted_date) . "-" . $this->sex[$key]["adult"] . "--",
                    "baby" => [
                        "number" => $key + 1,
                        "name" => $passenger["baby"],
                        "lastName" => $this->lastName[$key]["baby"],
                        "free" => "----" . strtoupper($formatted_dateBaby) . "-" . $this->sex[$key]["baby"] . "--",
                        "birth" => $dateBaby->format('Y-m-d'),
                        "offspring" => false
                    ]
                ];
            } else {
                // Pasajero adulto solo
                $travellers[] = [
                    "number" => $key + 1,
                    "name" => $passenger["adult"],
                    "free" => "----" . strtoupper($formatted_date) . "-" . $this->sex[$key]["adult"] . "--",
                    "lastName" => $this->lastName[$key]["adult"],
                    "passengerType" => $this->gener[$key]["adult"],
                ];
            }
        } elseif ($this->gener[$key] === "CHD") {
            // Pasajero niño
            $date = Carbon::createFromFormat('Y-m-d', $this->birth[$key]);
            $formatted_date = $date->format('dMy');
            $travellers[] = [
                "number" => $key + 1,
                "name" => $passenger,
                "free" => "----" . strtoupper($formatted_date) . "-" . $this->sex[$key] . "--",
                "lastName" => $this->lastName[$key],
                "passengerType" => $this->gener[$key],
                "birth" => $date->format('Y-m-d')
            ];
        } elseif ($this->gener[$key] === "SEAT") {
            // Infante con asiento
            $date = Carbon::createFromFormat('Y-m-d', $this->birth[$key]);
            $formatted_date = $date->format('dMy');
            $travellers[] = [
                "number" => $key + 1,
                "name" => $passenger,
                "free" => "----" . strtoupper($formatted_date) . "-" . $this->sex[$key] . "--",
                "lastName" => $this->lastName[$key],
                "passengerType" => $this->gener[$key],
                "birth" => $date->format('Y-m-d')
            ];
        }
    }
    
    // Construir itinerario
    $itinerary = [];
    foreach ($this->going["going"] as $key => $going) {
        if (!$this->family) {
            $itinerary[] = [
                "group" => $key + 1,
                "from" => $going["location"]["departure"],
                "to" => $going["location"]["arrival"],
                "bookingClass" => $going["cabin"][$key]["productInformation"]["cabinProduct"]["rbd"],
                "dateDeparture" => $going["productDateTime"]["dateOfDeparture"] . "T" . $going["productDateTime"]["timeOfDeparture"] . ":00+0000",
                "company" => $going["companyId"]["marketingCarrier"],
                "flightNumber" => $going["flightOrtrainNumber"],
            ];
        } else {
            $itinerary[] = [
                "group" => $key + 1,
                "from" => $going["location"]["departure"],
                "to" => $going["location"]["arrival"],
                "bookingClass" => $this->family["cabin"][$key]["cabin"],
                "dateDeparture" => $going["productDateTime"]["dateOfDeparture"] . "T" . $going["productDateTime"]["timeOfDeparture"] . ":00+0000",
                "company" => $going["companyId"]["marketingCarrier"],
                "flightNumber" => $going["flightOrtrainNumber"],
                "family" => $this->family["going"]
            ];
        }
    }
    
    // Procesar vuelta si existe
    if ($this->return) {
        $count = count($this->going["going"]);
        $cabin = count($this->going["going"]);
        foreach ($this->return as $key => $return) {
            if (!$this->family) {
                $itinerary[] = [
                    "group" => ++$count,
                    "from" => $return["location"]["departure"],
                    "to" => $return["location"]["arrival"],
                    "bookingClass" => $return["cabin"][$key]["productInformation"]["cabinProduct"]["rbd"],
                    "dateDeparture" => $return["productDateTime"]["dateOfDeparture"] . "T" . $return["productDateTime"]["timeOfDeparture"] . ":00+0000",
                    "company" => $return["companyId"]["marketingCarrier"],
                    "flightNumber" => $return["flightOrtrainNumber"],
                ];
            } else {
                $itinerary[] = [
                    "group" => ++$count,
                    "from" => $return["location"]["departure"],
                    "to" => $return["location"]["arrival"],
                    "bookingClass" => $this->family["cabin"][$cabin + $key]["cabin"],
                    "dateDeparture" => $return["productDateTime"]["dateOfDeparture"] . "T" . $return["productDateTime"]["timeOfDeparture"] . ":00+0000",
                    "company" => $return["companyId"]["marketingCarrier"],
                    "flightNumber" => $return["flightOrtrainNumber"],
                    "family" => $this->family["return"],
                ];
            }
        }
    }
    
    // Crear PNR
    $new_email = str_replace('@', '//', $this->email);
    $new_email = str_replace('_', '..', $new_email);
    $new_email = str_replace('-', './', $new_email);
    
    $user = User::find(auth()->id());
    $office = $user->offices()->where("state", "Activo")->first();
    
    $pnr = [
        "user_id" => $user->id,
        "office" => $office->id,
        "admin" => $office->admin->id,
        "company" => $this->going["going"][0]["companyGeneral"],
        "bag" => false,
        "fare" => "RP",
        "tel" => $this->tel,
        "email" => $new_email,
        "emailTwo" => $this->email,
        "travellers" => $travellers,
        "itinerary" => $itinerary
    ];
    
    // Enviar a API Amadeus
    $this->pnr = Http::post(env('APP_TRAVEL')."/api/savepnr", $pnr)->json();

    if (!isset($this->pnr["error"])) {
        AmadeusReserve::create([
            "control_number" => $this->pnr["reserve"]["control_number"], 
            "reserve_id" => $this->pnr["reserve"]["id"]
        ]);
        $this->control_number = $this->pnr["reserve"]["control_number"];

        Cache::put("ticket", [
            "pnr" => $this->pnr["reserve"]["control_number"],
            "going" => $this->going,
            "return" => $this->return,
            "family" => $this->family,
            "reserve_id" => $this->pnr["reserve"]["id"],
            "paxes" => $this->pnr["reserve"]["travellers"]
        ]);
        redirect()->route("flights.ticket");
    }
}
```

### Validaciones:
```php
protected $rules = [
    "tel" => "required",
    "email" => "required|email",
    "name.*.adult" => "required|regex:/^[a-zA-Z\s]+$/",
    "lastName.*.adult" => "required|regex:/^[a-zA-Z\s]+$/",
    "gener.*.adult" => "required",
    "sex.*.adult" => "required",
    "birth.*.adult" => "required",
    "name.*.baby" => "required|regex:/^[a-zA-Z\s]+$/",
    "lastName.*.baby" => "required|regex:/^[a-zA-Z\s]+$/",
    "sex.*.baby" => "required",
    "birth.*.baby" => "required",
    "name.*" => "required|regex:/^[a-zA-Z\s]+$/",
    "lastName.*" => "required|regex:/^[a-zA-Z\s]+$/",
    "gener.*" => "required",
    "sex.*" => "required",
    "birth.*" => "required"
];
```

## 4. ShowTicket.php - Emisión de Tiquetes

### Propiedades principales:
```php
public $going, $return, $family;    // Datos de vuelo
public $control_number;             // Número de control PNR
public $reserve_id;                 // ID de reserva
public $price = 0;                  // Precio total
public $passengers;                 // Datos de pasajeros
public $tickets;                    // Tiquetes emitidos
public $fares;                      // Tarifas
public $fare = 0;                   // Tarifa calculada
public $travellers;                 // Viajeros
public $card;                       // Datos de tarjeta
public $pnr;                        // Datos PNR
public $successMessage = "";        // Mensaje de éxito/error
public $success = true;             // Estado de operación
```

### Métodos principales:

#### emitTkt() - Emitir tiquete con tarjeta
```php
public function emitTkt()
{
    // Calcular tarifa total
    foreach ($this->fares as $fare) {
        foreach ($fare["fare"] as $key => $fareTotal) {
            if ($fareTotal["fareDataQualifier"] == "712") {
                $this->fare += $fareTotal["fareAmount"] * $fare["pax"];
            }
        }
    }
    
    $this->card = json_decode($this->card, true);

    // Recuperar PNR
    $record = $this->pnrRetrieve($this->tkt);
    
    if (is_string($record)) {
        $this->successMessage = $record;
        $this->success = false;
    } else {
        $ticket = [
            'session' => $record['session'],
            'record' => $this->tkt,
            "day" => $this->going["going"][0]["productDateTime"]["dateOfDeparture"],
            "hour" => $this->going["going"][0]["productDateTime"]["timeOfDeparture"],
            "value" => $this->fare,
            "rec" => $record["rec"],
            "cash" => true,
            "ti" => false,
            "multi" => false,
            "pay" => [
                "card_id" => $this->card["id"],
                "user_id" => "" . $this->user->id,
                "email" => $this->user->email,
                "description" => "emit_ticket",
                "dev_reference" => $this->card["transaction_reference"],
                "token" => $this->card["token"],
                "amount" => $this->fare,
                "vat" => 0,
                "cvc" => ""
            ]
        ];
        
        // Enviar a API Amadeus
        $tickets = Http::post(env('APP_TRAVEL')."/api/ticket", $ticket)->json();
        
        if (isset($tickets["ticket"])) {
            $this->successMessage = "Tiquetes emitidos";
            $this->success = true;
        } else {
            $this->successMessage = "La transaccion no se realizo con exito";
            $this->success = false;
        }
    }
}
```

#### tkt_pse() - Emitir tiquete con PSE
```php
public function tkt_pse()
{
    $record = $this->pnrRetrieve($this->tkt);
    
    if (is_string($record)) {
        $this->successMessage = $record;
        $this->success = false;
    } else {
        $office = $this->user->offices()->where("state", "Activo")->first();
        
        // Calcular tarifa
        foreach ($this->fares as $fare) {
            foreach ($fare["fare"] as $key => $fareTotal) {
                if ($fareTotal["fareDataQualifier"] == "712") {
                    $this->fare += $fareTotal["fareAmount"] * $fare["pax"];
                }
            }
        }
        
        // Crear pago PSE
        $pay = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Auth-Token' => $this->authToken()
        ])->post('https://noccapi-stg.paymentez.com/linktopay/init_order/', [
            "user" => [
                "id" => "" . $this->user->id,
                "email" => $this->user->email,
                "name" => $this->user->name,
                "last_name" => $this->user->lastname ? $this->user->lastname : $office->name
            ],
            "order" => [
                "dev_reference" => $this->tkt,
                "description" => "" . $record["rec"],
                "amount" => $this->fare,
                "installments_type" => 0,
                "currency" => "COP"
            ],
            "configuration" => [
                "partial_payment" => true,
                "expiration_days" => 1,
                "allowed_payment_methods" => ["All"],
                "success_url" => "https://aiop.com.co/pse/pnr",
                "failure_url" => "https://aiop.com.co/pse/pnr",
                "pending_url" => "https://aiop.com.co/pse/pnr",
                "review_url" => "https://aiop.com.co/pse/pnr"
            ]
        ])->json();
        
        return redirect($pay["data"]["payment"]["payment_url"]);
    }
}
```

#### authToken() - Generar token de autenticación Paymentez
```php
public function authToken()
{
    $API_LOGIN_DEV = "WELLEZYSAS-STG-CO-SERVER";
    $API_KEY_DEV = "KABByQ6JQ5mx30MvdE1dnPPw7NQHw3";

    $server_application_code = $API_LOGIN_DEV;
    $server_app_key = $API_KEY_DEV;
    $date = new DateTime();
    $unix_timestamp = $date->getTimestamp();
    $uniq_token_string = $server_app_key . $unix_timestamp;
    $uniq_token_hash = hash('sha256', $uniq_token_string);
    $auth_token = base64_encode($server_application_code . ";" . $unix_timestamp . ";" . $uniq_token_hash);

    return $auth_token;
}
```

## 5. ConsultPnr.php - Consulta de PNR

### Propiedades principales:
```php
public $reserve;                   // Datos de reserva
public $operational_change = false; // Cambio operacional
```

### Métodos principales:

#### mount() - Cargar datos de PNR
```php
public function mount()
{
    $this->reserve = Http::post(env('APP_TRAVEL')."/api/retrieve", [
        'record' => $this->reserve,
    ])->json();
    
    // Verificar cambios operacionales
    if (!empty($this->reserve['itinerariesChangerData'])) {
        foreach ($this->reserve['itinerariesChangerData'] as $itinerario) {
            if ($itinerario['relatedProduct']['status'] != 'HK') {
                $this->operational_change = true;
                break;
            }
        }
    }
}
```

## 6. Vistas Blade Principales

### search-show.blade.php - Formulario de búsqueda
```html
<!-- Búsqueda de aeropuertos con autocompletado -->
<div class="form-control-md input-form bg-white">
    <label class="text-xs ml-3" for="">Origen*</label>
    <input value="{{ $departure }}" type="text"
        class="col flex-2 pb-3 rounded input-gds w-full" autocomplete="off"
        placeholder="Origen*" wire:model.debounce.300ms="searchDeparture" />

    <div class="absolute invisible scrollspy-example"
        :class="{ 'invisible': !$wire.openDep }" @click.away="$wire.openDep=false">
        <div class="bg-gray-300 shadow-xl pt-2 mt-1 rounded scrollspy-example">
            <div class="px-4 py-3">
                @forelse ($field as $route)
                    <button class="hover:text-white hover:bg-sky-500"
                        wire:click="selectDeparture('{{ $route['iata'] }}','{{ $route['city'] }}', '{{ $route['name'] }}')">
                        {{ $route['iata'] }} | {{ $route['city'] }} | {{ $route['name'] }}
                    </button><br>
                @empty
                    <p>No existe ningún destino que coincida</p>
                @endforelse
            </div>
        </div>
    </div>
</div>

<!-- Formulario de pasajeros -->
<div class="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2">
    <div>
        <div class="form-control-md input-form bg-white">
            <label class="text-xs ml-3" for="">Adultos*</label><br>
            <input wire:model.defer="adult" class="input-gds w-full" type="number" max="9" min="1">
        </div>
    </div>
    <div>
        <div class="form-control-md input-form bg-white">
            <label class="text-xs ml-3" for="">Niños</label><br>
            <input wire:model.defer="child" class="input-gds w-full" type="number" max="5" min="0">
        </div>
    </div>
    <div>
        <div class="form-control-md input-form bg-white">
            <label class="text-xs ml-3" for="">Infantes</label><br>
            <input wire:model.defer="baby" class="input-gds w-full" type="number" max="{{ $adult }}" min="0">
        </div>
    </div>
    <div>
        <div class="form-control-md input-form bg-white">
            <label class="text-xs ml-3" for="">Inf. silla</label><br>
            <input wire:model.defer="seat" class="input-gds w-full" type="number" max="5" min="0">
        </div>
    </div>
</div>

<!-- Botón de búsqueda -->
<button wire:click="save" wire:loading.attr="disabled" class="button h-full">
    <svg>...</svg>
</button>
```

## 7. Eventos y Listeners

### Eventos principales:
```php
// En SearchShow
$this->emit('eventFlight', "change");

// En ShowResponse
$this->emit("flightQuoteGds");

// Listeners en ShowSegment
protected $listeners = ["savePnr", "voucher"];

// Listeners en ShowResponse
protected $listeners = ["render", "save", "submit", "families"];
```

## 8. Query Strings para persistencia

```php
// En SearchShow
protected $queryString = [
    "adult" => ['except' => 1],
    "child" => ['except' => 0],
    "baby" => ['except' => 0],
    "roundtrip" => ['except' => 0],
    "seat" => ['except' => 0],
    "hourDeparture",
    "hourArrival",
    "searchArrival",
    "searchDeparture",
    "arrival",
    "departure"
];

// En ShowSegment
protected $queryString = [
    "control_number", 
    "passengers", 
    "name", 
    "lastName", 
    "birth", 
    "sex", 
    "gener", 
    "number", 
    "tel", 
    "email"
];
```

Esta documentación detallada de los componentes Livewire te permitirá entender completamente cómo funciona el flujo de reservas y emisión de tiquetes, y recrear cada componente con toda su funcionalidad.
