# ⚡ COMPONENTES LIVEWIRE COMPLETOS - SISTEMA CRM WELLEZY

## 1. COMPONENTE PRINCIPAL: SearchShow

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class SearchShow extends Component
{
    public $searchType = 'flight';
    public $departure = '';
    public $arrival = '';
    public $departureDate = '';
    public $returnDate = '';
    public $passengers = 1;
    public $searchDeparture = '';
    public $searchArrival = '';
    public $openDep = false;
    public $openArr = false;
    public $field = [];

    protected $queryString = [
        'searchType', 'departure', 'arrival', 'departureDate', 'returnDate', 'passengers'
    ];

    public function updatedSearchDeparture()
    {
        $this->openDep = true;
        $this->fetchLocations($this->searchDeparture, 'departure');
    }

    public function updatedSearchArrival()
    {
        $this->openArr = true;
        $this->fetchLocations($this->searchArrival, 'arrival');
    }

    public function selectDeparture($code, $city, $name)
    {
        $this->searchDeparture = $name;
        $this->departure = $code;
        $this->openDep = false;
    }

    public function selectArrival($code, $city, $name)
    {
        $this->searchArrival = $name;
        $this->arrival = $code;
        $this->openArr = false;
    }

    private function fetchLocations($query, $type)
    {
        if (strlen($query) >= 3) {
            $response = Http::post(env('APP_TRAVEL')."/api/locations", [
                'query' => $query,
                'type' => $type
            ])->json();
            $this->field = $response;
        } else {
            $this->field = [];
        }
    }

    protected $rules = [
        'searchType' => 'required|in:flight,hotel,transfer,medical',
        'departure' => 'required|string',
        'arrival' => 'required|string',
        'departureDate' => 'required|date|after:today',
        'returnDate' => 'nullable|date|after:departureDate',
        'passengers' => 'required|integer|min:1|max:9',
    ];

    public function search()
    {
        $this->validate();

        $searchData = [
            'type' => $this->searchType,
            'departure' => $this->departure,
            'arrival' => $this->arrival,
            'departure_date' => $this->departureDate,
            'return_date' => $this->returnDate,
            'passengers' => $this->passengers
        ];

        $result = $this->performSearch($searchData);
        
        if ($result['success']) {
            Cache::put('searchResults', [
                'search' => $searchData,
                'results' => $result['data']
            ]);
            redirect()->route('search-results');
        } else {
            session()->flash('error', $result['message']);
        }
    }

    private function performSearch($data)
    {
        $endpoint = match($data['type']) {
            'flight' => '/api/flights/search',
            'hotel' => '/api/hotels/search',
            'transfer' => '/api/transfers/search',
            'medical' => '/api/medical/search',
        };

        $response = Http::post(env('APP_TRAVEL').$endpoint, $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["results"]
        ];
    }

    public function render()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');
        $maxDate = now()->addYear()->format('Y-m-d');
        
        return view('livewire.search-show', compact('tomorrow', 'maxDate'));
    }
}
```

## 2. COMPONENTE: SearchResults

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\Cache;

class SearchResults extends Component
{
    public $results = [];
    public $search = [];
    public $selectedResult = null;
    public $resultDetails = null;

    public function mount()
    {
        $cache = Cache::get('searchResults');
        $this->search = $cache['search'];
        $this->results = $cache['results'];
    }

    public function selectResult($resultId)
    {
        $this->selectedResult = $resultId;
        $result = $this->getResultDetails($resultId);
        
        if ($result['success']) {
            $this->resultDetails = $result['data'];
        }
    }

    public function proceedToBooking($resultId)
    {
        $bookingData = array_merge($this->search, ['result_id' => $resultId]);
        Cache::put('bookingData', $bookingData);
        
        $route = match($this->search['type']) {
            'flight' => 'flight-booking',
            'hotel' => 'hotel-booking',
            'transfer' => 'transfer-booking',
            'medical' => 'medical-booking',
        };
        
        redirect()->route($route);
    }

    private function getResultDetails($resultId)
    {
        $endpoint = match($this->search['type']) {
            'flight' => '/api/flights/details',
            'hotel' => '/api/hotels/details',
            'transfer' => '/api/transfers/details',
            'medical' => '/api/medical/details',
        };

        $response = Http::post(env('APP_TRAVEL').$endpoint, [
            'result_id' => $resultId
        ])->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["result"]
        ];
    }

    public function render()
    {
        return view('livewire.search-results');
    }
}
```

## 3. COMPONENTE: BookingForm

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Reserve;
use App\Models\Contact;
use Illuminate\Support\Facades\Cache;

class BookingForm extends Component
{
    public $bookingData = [];
    public $contactInfo = [
        'first_name' => '',
        'last_name' => '',
        'email' => '',
        'phone' => '',
        'document' => '',
        'birth_date' => '',
        'gender' => ''
    ];
    public $passengerInfo = [];
    public $specialRequests = '';
    public $totalAmount = 0;
    public $successMessage = '';
    public $errorMessage = '';

    public function mount()
    {
        $this->bookingData = Cache::get('bookingData');
        $this->calculateTotal();
    }

    public function updatedContactInfo()
    {
        $this->validateContactInfo();
    }

    public function addPassenger()
    {
        $this->passengerInfo[] = [
            'first_name' => '',
            'last_name' => '',
            'email' => '',
            'phone' => '',
            'document' => '',
            'birth_date' => '',
            'gender' => ''
        ];
    }

    public function removePassenger($index)
    {
        unset($this->passengerInfo[$index]);
        $this->passengerInfo = array_values($this->passengerInfo);
    }

    private function calculateTotal()
    {
        $this->totalAmount = $this->bookingData['price'] ?? 0;
    }

    protected $rules = [
        'contactInfo.first_name' => 'required|string|max:255',
        'contactInfo.last_name' => 'required|string|max:255',
        'contactInfo.email' => 'required|email',
        'contactInfo.phone' => 'required|string',
        'contactInfo.document' => 'required|string',
        'contactInfo.birth_date' => 'required|date',
        'contactInfo.gender' => 'required|in:M,F',
    ];

    public function createBooking()
    {
        $this->validate();

        try {
            // Crear contacto
            $contact = Contact::create($this->contactInfo);

            // Crear reserva
            $reserve = Reserve::create([
                'user_id' => auth()->id(),
                'office_id' => auth()->user()->office_id,
                'contact_id' => $contact->id,
                'type' => $this->bookingData['type'],
                'status' => 'pending',
                'total_amount' => $this->totalAmount,
                'currency' => 'COP',
                'notes' => $this->specialRequests
            ]);

            // Crear reserva específica según el tipo
            $this->createSpecificReserve($reserve);

            $this->successMessage = 'Reserva creada exitosamente';
            redirect()->route('reserve-confirmation', $reserve->id);
        } catch (\Exception $e) {
            $this->errorMessage = 'Error al crear la reserva: ' . $e->getMessage();
        }
    }

    private function createSpecificReserve($reserve)
    {
        switch ($this->bookingData['type']) {
            case 'flight':
                $reserve->amadeusReserve()->create([
                    'reserve_id' => $reserve->id,
                    'type' => 'flight',
                    'status' => 'pending',
                    'total_amount' => $this->totalAmount,
                    'currency' => 'COP'
                ]);
                break;
            case 'hotel':
                $reserve->restelReserve()->create([
                    'reserve_id' => $reserve->id,
                    'type' => 'hotel',
                    'status' => 'pending',
                    'total_amount' => $this->totalAmount,
                    'currency' => 'COP'
                ]);
                break;
            case 'transfer':
                $reserve->terrawindReserve()->create([
                    'reserve_id' => $reserve->id,
                    'type' => 'transfer',
                    'status' => 'pending',
                    'total_amount' => $this->totalAmount,
                    'currency' => 'COP'
                ]);
                break;
            case 'medical':
                $reserve->medicalReserve()->create([
                    'reserve_id' => $reserve->id,
                    'type' => 'medical',
                    'status' => 'pending',
                    'total_amount' => $this->totalAmount,
                    'currency' => 'COP'
                ]);
                break;
        }
    }

    public function render()
    {
        return view('livewire.booking-form');
    }
}
```

## 4. COMPONENTE: ReserveConfirmation

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Reserve;

class ReserveConfirmation extends Component
{
    public $reserve;
    public $reserveDetails = null;

    public function mount($reserveId)
    {
        $this->reserve = Reserve::with([
            'user', 'office', 'contact', 'deal', 'team', 'merchant',
            'amadeusReserve', 'restelReserve', 'terrawindReserve', 
            'medicalReserve', 'transferReserve', 'payment'
        ])->findOrFail($reserveId);
        
        $this->loadReserveDetails();
    }

    private function loadReserveDetails()
    {
        switch ($this->reserve->type) {
            case 'flight':
                $this->reserveDetails = $this->reserve->amadeusReserve;
                break;
            case 'hotel':
                $this->reserveDetails = $this->reserve->restelReserve;
                break;
            case 'transfer':
                $this->reserveDetails = $this->reserve->terrawindReserve;
                break;
            case 'medical':
                $this->reserveDetails = $this->reserve->medicalReserve;
                break;
        }
    }

    public function printReserve()
    {
        $this->dispatchBrowserEvent('print-reserve');
    }

    public function sendConfirmationEmail()
    {
        // Lógica para enviar email de confirmación
        $this->dispatchBrowserEvent('email-sent');
    }

    public function render()
    {
        return view('livewire.reserve-confirmation');
    }
}
```

## 5. COMPONENTE: ReserveList

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Reserve;
use App\Models\User;

class ReserveList extends Component
{
    public $reserves = [];
    public $office;
    public $admin;
    public $user;
    public $filters = [
        'status' => '',
        'type' => '',
        'date_from' => '',
        'date_to' => ''
    ];

    public function mount()
    {
        $this->user = User::find(auth()->id());
        $roles = $this->user->getRoleNames()->toArray();
        $this->office = $this->user->offices()->where("state", "Activo")->first();
        $this->admin = $this->office->admin;

        $rolesPrioritarios = ['super admin', 'admin', "supervisor", 'adviser'];

        $role = null;
        foreach ($rolesPrioritarios as $rol) {
            if (in_array($rol, $roles)) {
                $role = $rol;
                break;
            }
        }
        
        $this->reserves = $this->getReservesByRole($role);
    }

    public function applyFilters()
    {
        $query = Reserve::with(['user', 'office', 'contact', 'deal', 'team', 'merchant']);

        if ($this->filters['status']) {
            $query->where('status', $this->filters['status']);
        }

        if ($this->filters['type']) {
            $query->where('type', $this->filters['type']);
        }

        if ($this->filters['date_from']) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if ($this->filters['date_to']) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        $this->reserves = $query->orderBy('created_at', 'desc')->get();
    }

    public function clearFilters()
    {
        $this->filters = [
            'status' => '',
            'type' => '',
            'date_from' => '',
            'date_to' => ''
        ];
        $this->applyFilters();
    }

    private function getReservesByRole($role)
    {
        $query = Reserve::with(['user', 'office', 'contact', 'deal', 'team', 'merchant']);

        if ($role == "super admin") {
            // Mostrar todas las reservas
        } elseif ($role == "admin") {
            $query->where('office_id', $this->office->id);
        } elseif ($role == "supervisor") {
            $query->where('office_id', $this->office->id);
        } elseif ($role == "adviser") {
            $query->where('user_id', $this->user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function render()
    {
        return view('livewire.reserve-list');
    }
}
```

## 6. COMPONENTE: PaymentForm

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Reserve;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class PaymentForm extends Component
{
    public $reserve;
    public $paymentMethod = 'card';
    public $cardInfo = [
        'number' => '',
        'expiry' => '',
        'cvc' => '',
        'name' => ''
    ];
    public $pseInfo = [
        'bank' => '',
        'account_type' => ''
    ];
    public $totalAmount = 0;
    public $successMessage = '';
    public $errorMessage = '';

    public function mount($reserveId)
    {
        $this->reserve = Reserve::findOrFail($reserveId);
        $this->totalAmount = $this->reserve->total_amount;
    }

    public function processPayment()
    {
        $this->validate();

        try {
            $paymentData = [
                'reserve_id' => $this->reserve->id,
                'amount' => $this->totalAmount,
                'currency' => 'COP',
                'payment_method' => $this->paymentMethod,
                'status' => 'pending'
            ];

            if ($this->paymentMethod === 'card') {
                $paymentData['card_info'] = $this->cardInfo;
            } elseif ($this->paymentMethod === 'pse') {
                $paymentData['pse_info'] = $pseInfo;
            }

            $result = $this->processPaymentWithProvider($paymentData);
            
            if ($result['success']) {
                $this->reserve->update(['status' => 'confirmed']);
                $this->successMessage = 'Pago procesado exitosamente';
            } else {
                $this->errorMessage = $result['message'];
            }
        } catch (\Exception $e) {
            $this->errorMessage = 'Error al procesar el pago: ' . $e->getMessage();
        }
    }

    private function processPaymentWithProvider($data)
    {
        $response = Http::post(env('APP_TRAVEL')."/api/payments/process", $data)->json();
        
        if (isset($response["error"])) {
            return [
                "success" => false,
                "message" => $response["error"]
            ];
        }
        
        return [
            "success" => true,
            "data" => $response["payment"]
        ];
    }

    protected $rules = [
        'paymentMethod' => 'required|in:card,pse,cash,transfer',
        'cardInfo.number' => 'required_if:paymentMethod,card|string',
        'cardInfo.expiry' => 'required_if:paymentMethod,card|string',
        'cardInfo.cvc' => 'required_if:paymentMethod,card|string',
        'cardInfo.name' => 'required_if:paymentMethod,card|string',
        'pseInfo.bank' => 'required_if:paymentMethod,pse|string',
        'pseInfo.account_type' => 'required_if:paymentMethod,pse|string',
    ];

    public function render()
    {
        return view('livewire.payment-form');
    }
}
```

## 7. COMPONENTE: Dashboard

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Reserve;
use App\Models\User;
use App\Models\Contact;
use App\Models\Deal;

class Dashboard extends Component
{
    public $stats = [];
    public $recentReserves = [];
    public $recentContacts = [];
    public $recentDeals = [];

    public function mount()
    {
        $this->loadStats();
        $this->loadRecentData();
    }

    private function loadStats()
    {
        $this->stats = [
            'total_reserves' => Reserve::count(),
            'pending_reserves' => Reserve::where('status', 'pending')->count(),
            'confirmed_reserves' => Reserve::where('status', 'confirmed')->count(),
            'total_revenue' => Reserve::sum('total_amount'),
            'total_contacts' => Contact::count(),
            'total_deals' => Deal::count(),
            'active_users' => User::where('is_active', true)->count(),
        ];
    }

    private function loadRecentData()
    {
        $this->recentReserves = Reserve::with(['user', 'contact', 'deal'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $this->recentContacts = Contact::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $this->recentDeals = Deal::with(['contact'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    public function render()
    {
        return view('livewire.dashboard');
    }
}
```

## 8. COMPONENTE: ContactForm

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Contact;

class ContactForm extends Component
{
    public $contact;
    public $isEdit = false;
    public $contactData = [
        'first_name' => '',
        'last_name' => '',
        'email' => '',
        'phone' => '',
        'document' => '',
        'birth_date' => '',
        'gender' => '',
        'address' => '',
        'city' => '',
        'country' => '',
        'notes' => ''
    ];

    public function mount($contactId = null)
    {
        if ($contactId) {
            $this->contact = Contact::findOrFail($contactId);
            $this->isEdit = true;
            $this->contactData = $this->contact->toArray();
        }
    }

    public function save()
    {
        $this->validate();

        try {
            if ($this->isEdit) {
                $this->contact->update($this->contactData);
                $this->dispatchBrowserEvent('contact-updated');
            } else {
                Contact::create($this->contactData);
                $this->dispatchBrowserEvent('contact-created');
            }
        } catch (\Exception $e) {
            $this->dispatchBrowserEvent('contact-error', ['message' => $e->getMessage()]);
        }
    }

    protected $rules = [
        'contactData.first_name' => 'required|string|max:255',
        'contactData.last_name' => 'required|string|max:255',
        'contactData.email' => 'required|email|unique:contacts,email,' . ($this->contact->id ?? 'NULL'),
        'contactData.phone' => 'required|string',
        'contactData.document' => 'required|string|unique:contacts,document,' . ($this->contact->id ?? 'NULL'),
        'contactData.birth_date' => 'required|date',
        'contactData.gender' => 'required|in:M,F',
        'contactData.address' => 'nullable|string',
        'contactData.city' => 'nullable|string',
        'contactData.country' => 'nullable|string',
        'contactData.notes' => 'nullable|string',
    ];

    public function render()
    {
        return view('livewire.contact-form');
    }
}
```

## 9. COMPONENTE: DealForm

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Deal;
use App\Models\Contact;

class DealForm extends Component
{
    public $deal;
    public $isEdit = false;
    public $dealData = [
        'contact_id' => '',
        'title' => '',
        'description' => '',
        'amount' => 0,
        'stage' => 'lead',
        'status' => 'open',
        'expected_close_date' => '',
        'notes' => ''
    ];
    public $contacts = [];

    public function mount($dealId = null)
    {
        $this->contacts = Contact::all();
        
        if ($dealId) {
            $this->deal = Deal::findOrFail($dealId);
            $this->isEdit = true;
            $this->dealData = $this->deal->toArray();
        }
    }

    public function save()
    {
        $this->validate();

        try {
            if ($this->isEdit) {
                $this->deal->update($this->dealData);
                $this->dispatchBrowserEvent('deal-updated');
            } else {
                Deal::create($this->dealData);
                $this->dispatchBrowserEvent('deal-created');
            }
        } catch (\Exception $e) {
            $this->dispatchBrowserEvent('deal-error', ['message' => $e->getMessage()]);
        }
    }

    protected $rules = [
        'dealData.contact_id' => 'required|exists:contacts,id',
        'dealData.title' => 'required|string|max:255',
        'dealData.description' => 'nullable|string',
        'dealData.amount' => 'required|numeric|min:0',
        'dealData.stage' => 'required|in:lead,prospect,proposal,negotiation,closed',
        'dealData.status' => 'required|in:open,won,lost,closed',
        'dealData.expected_close_date' => 'nullable|date',
        'dealData.notes' => 'nullable|string',
    ];

    public function render()
    {
        return view('livewire.deal-form');
    }
}
```

## 10. COMPONENTE: UserManagement

```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\User;
use App\Models\Office;
use Spatie\Permission\Models\Role;

class UserManagement extends Component
{
    public $users = [];
    public $offices = [];
    public $roles = [];
    public $filters = [
        'office_id' => '',
        'role' => '',
        'status' => ''
    ];

    public function mount()
    {
        $this->loadData();
    }

    private function loadData()
    {
        $this->users = User::with(['office', 'roles'])->get();
        $this->offices = Office::all();
        $this->roles = Role::all();
    }

    public function applyFilters()
    {
        $query = User::with(['office', 'roles']);

        if ($this->filters['office_id']) {
            $query->where('office_id', $this->filters['office_id']);
        }

        if ($this->filters['role']) {
            $query->role($this->filters['role']);
        }

        if ($this->filters['status']) {
            $query->where('is_active', $this->filters['status'] === 'active');
        }

        $this->users = $query->get();
    }

    public function toggleUserStatus($userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['is_active' => !$user->is_active]);
        $this->loadData();
    }

    public function assignRole($userId, $roleId)
    {
        $user = User::findOrFail($userId);
        $role = Role::findOrFail($roleId);
        $user->assignRole($role);
        $this->loadData();
    }

    public function removeRole($userId, $roleId)
    {
        $user = User::findOrFail($userId);
        $role = Role::findOrFail($roleId);
        $user->removeRole($role);
        $this->loadData();
    }

    public function render()
    {
        return view('livewire.user-management');
    }
}
```

Esta documentación de componentes Livewire está completa y lista para implementar toda la funcionalidad del sistema CRM con búsqueda, reservas, pagos y gestión de usuarios.
