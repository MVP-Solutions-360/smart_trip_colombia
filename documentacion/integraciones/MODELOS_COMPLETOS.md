# 🗄️ MODELOS COMPLETOS - SISTEMA CRM WELLEZY

## 1. MODELO PRINCIPAL: Reserve

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reserve extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones principales
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function office()
    {
        return $this->belongsTo(Office::class);
    }
    
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
    
    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }
    
    public function team()
    {
        return $this->belongsTo(Team::class);
    }
    
    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }
    
    public function ticket()
    {
        return $this->morphOne(Ticket::class, 'ticketable');
    }
    
    public function amadeusReserve()
    {
        return $this->hasOne(AmadeusReserve::class);
    }
    
    public function restelReserve()
    {
        return $this->hasOne(RestelReserve::class);
    }
    
    public function terrawindReserve()
    {
        return $this->hasOne(TerrawindReserve::class);
    }
    
    public function medicalReserve()
    {
        return $this->hasOne(MedicalReserve::class);
    }
    
    public function transferReserve()
    {
        return $this->hasOne(TransferReserve::class);
    }
    
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    
    public function scopeByOffice($query, $officeId)
    {
        return $query->where('office_id', $officeId);
    }
    
    // Métodos de utilidad
    public function getTotalAmountAttribute()
    {
        $total = 0;
        
        if ($this->ticket) {
            $total += $this->ticket->total_amount;
        }
        
        if ($this->amadeusReserve) {
            $total += $this->amadeusReserve->total_amount;
        }
        
        if ($this->restelReserve) {
            $total += $this->restelReserve->total_amount;
        }
        
        if ($this->terrawindReserve) {
            $total += $this->terrawindReserve->total_amount;
        }
        
        if ($this->medicalReserve) {
            $total += $this->medicalReserve->total_amount;
        }
        
        if ($this->transferReserve) {
            $total += $this->transferReserve->total_amount;
        }
        
        return $total;
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'completed' => 'blue',
            default => 'gray'
        };
    }
}
```

## 2. MODELO: Ticket

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function ticketable()
    {
        return $this->morphTo();
    }
    
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->total_amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'issued' => 'blue',
            default => 'gray'
        };
    }
}
```

## 3. MODELO: AmadeusReserve

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AmadeusReserve extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->total_amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'issued' => 'blue',
            default => 'gray'
        };
    }
}
```

## 4. MODELO: RestelReserve

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RestelReserve extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->total_amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'issued' => 'blue',
            default => 'gray'
        };
    }
}
```

## 5. MODELO: TerrawindReserve

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TerrawindReserve extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->total_amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'issued' => 'blue',
            default => 'gray'
        };
    }
}
```

## 6. MODELO: MedicalReserve

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalReserve extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->total_amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'issued' => 'blue',
            default => 'gray'
        };
    }
}
```

## 7. MODELO: TransferReserve

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransferReserve extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->total_amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'issued' => 'blue',
            default => 'gray'
        };
    }
}
```

## 8. MODELO: Payment

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserve()
    {
        return $this->belongsTo(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->total_amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'completed' => 'blue',
            default => 'gray'
        };
    }
}
```

## 9. MODELO: TimeMark

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeMark extends Model
{
    use HasFactory;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function time_markable()
    {
        return $this->morphTo();
    }
    
    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
```

## 10. MODELO: User

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $hidden = [
        'password',
        'remember_token',
    ];
    
    protected $casts = [
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function office()
    {
        return $this->belongsTo(Office::class);
    }
    
    public function reserves()
    {
        return $this->hasMany(Reserve::class);
    }
    
    public function time_marks()
    {
        return $this->morphMany(TimeMark::class, 'time_markable');
    }
    
    // Scopes
    public function scopeByOffice($query, $officeId)
    {
        return $query->where('office_id', $officeId);
    }
    
    public function scopeByRole($query, $role)
    {
        return $query->role($role);
    }
    
    // Métodos de utilidad
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }
    
    public function getInitialsAttribute()
    {
        return strtoupper(substr($this->first_name, 0, 1) . substr($this->last_name, 0, 1));
    }
}
```

## 11. MODELO: Office

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Office extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function users()
    {
        return $this->hasMany(User::class);
    }
    
    public function reserves()
    {
        return $this->hasMany(Reserve::class);
    }
    
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
    
    // Scopes
    public function scopeActive($query)
    {
        return $query->where('state', 'Activo');
    }
    
    // Métodos de utilidad
    public function getIsActiveAttribute()
    {
        return $this->state === 'Activo';
    }
}
```

## 12. MODELO: Contact

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserves()
    {
        return $this->hasMany(Reserve::class);
    }
    
    public function deals()
    {
        return $this->hasMany(Deal::class);
    }
    
    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    // Métodos de utilidad
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }
    
    public function getFormattedPhoneAttribute()
    {
        return preg_replace('/(\d{3})(\d{3})(\d{4})/', '($1) $2-$3', $this->phone);
    }
}
```

## 13. MODELO: Deal

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deal extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
    
    public function reserves()
    {
        return $this->hasMany(Reserve::class);
    }
    
    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function scopeByStage($query, $stage)
    {
        return $query->where('stage', $stage);
    }
    
    // Métodos de utilidad
    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 0, ',', '.');
    }
    
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'open' => 'blue',
            'won' => 'green',
            'lost' => 'red',
            'closed' => 'gray',
            default => 'yellow'
        };
    }
}
```

## 14. MODELO: Team

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
    
    public function reserves()
    {
        return $this->hasMany(Reserve::class);
    }
    
    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    // Métodos de utilidad
    public function getIsActiveAttribute()
    {
        return $this->is_active;
    }
}
```

## 15. MODELO: Merchant

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Merchant extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $guarded = ["id", "created_at", "updated_at"];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relaciones
    public function reserves()
    {
        return $this->hasMany(Reserve::class);
    }
    
    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    // Métodos de utilidad
    public function getIsActiveAttribute()
    {
        return $this->is_active;
    }
}
```

## 16. VALIDACIONES GLOBALES

### Validaciones para Reserve
```php
protected $rules = [
    'user_id' => 'required|exists:users,id',
    'office_id' => 'required|exists:offices,id',
    'contact_id' => 'required|exists:contacts,id',
    'deal_id' => 'nullable|exists:deals,id',
    'team_id' => 'nullable|exists:teams,id',
    'merchant_id' => 'nullable|exists:merchants,id',
    'type' => 'required|in:flight,hotel,transfer,medical,package',
    'status' => 'required|in:pending,confirmed,cancelled,completed',
    'total_amount' => 'required|numeric|min:0',
    'currency' => 'required|string|max:3',
    'notes' => 'nullable|string|max:1000',
];
```

### Validaciones para Ticket
```php
protected $rules = [
    'reserve_id' => 'required|exists:reserves,id',
    'type' => 'required|in:flight,hotel,transfer,medical,package',
    'status' => 'required|in:pending,confirmed,cancelled,issued',
    'total_amount' => 'required|numeric|min:0',
    'currency' => 'required|string|max:3',
    'confirmation_number' => 'nullable|string|max:255',
    'provider_reference' => 'nullable|string|max:255',
];
```

## 17. MIGRACIONES ADICIONALES

### Migración para reserves
```php
Schema::create('reserves', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('office_id');
    $table->unsignedBigInteger('contact_id');
    $table->unsignedBigInteger('deal_id')->nullable();
    $table->unsignedBigInteger('team_id')->nullable();
    $table->unsignedBigInteger('merchant_id')->nullable();
    $table->enum('type', ['flight', 'hotel', 'transfer', 'medical', 'package']);
    $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
    $table->decimal('total_amount', 10, 2);
    $table->string('currency', 3)->default('COP');
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->softDeletes();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('office_id')->references('id')->on('offices')->onDelete('cascade');
    $table->foreign('contact_id')->references('id')->on('contacts')->onDelete('cascade');
    $table->foreign('deal_id')->references('id')->on('deals')->onDelete('set null');
    $table->foreign('team_id')->references('id')->on('teams')->onDelete('set null');
    $table->foreign('merchant_id')->references('id')->on('merchants')->onDelete('set null');
    
    $table->index(['user_id', 'status']);
    $table->index(['office_id', 'status']);
    $table->index(['type', 'status']);
});
```

Esta documentación de modelos está completa y lista para implementar todo el sistema de reservas con todas las relaciones y funcionalidades necesarias.
