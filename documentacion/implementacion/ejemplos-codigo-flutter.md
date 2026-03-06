# Ejemplos de Código - Integración Flutter

## 📱 **Configuración Inicial de Flutter**

### **1. Estructura de Modelos**

#### **Cliente Model**
```dart
// lib/features/clients/models/client.dart
class Client {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? address;
  final DateTime createdAt;
  final DateTime updatedAt;

  Client({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.address,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      address: json['address'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'address': address,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

#### **Request Model (Cotización)**
```dart
// lib/features/requests/models/request.dart
class TravelRequest {
  final String id;
  final String clientId;
  final String clientName;
  final String requestType;
  final String destination;
  final String origin;
  final DateTime? requestDate;
  final DateTime? departureDate;
  final DateTime? returnDate;
  final int adults;
  final int children;
  final int infants;
  final double quotationValue;
  final String currency;
  final String status;
  final String? description;
  final DateTime createdAt;

  TravelRequest({
    required this.id,
    required this.clientId,
    required this.clientName,
    required this.requestType,
    required this.destination,
    required this.origin,
    this.requestDate,
    this.departureDate,
    this.returnDate,
    required this.adults,
    required this.children,
    required this.infants,
    required this.quotationValue,
    required this.currency,
    required this.status,
    this.description,
    required this.createdAt,
  });

  factory TravelRequest.fromJson(Map<String, dynamic> json) {
    return TravelRequest(
      id: json['id'],
      clientId: json['client_id'],
      clientName: json['client']['name'] ?? '',
      requestType: json['request_type'] ?? '',
      destination: json['destination'] ?? '',
      origin: json['origin'] ?? '',
      requestDate: json['request_date'] != null 
          ? DateTime.parse(json['request_date']) 
          : null,
      departureDate: json['departure_date'] != null 
          ? DateTime.parse(json['departure_date']) 
          : null,
      returnDate: json['return_date'] != null 
          ? DateTime.parse(json['return_date']) 
          : null,
      adults: json['adult'] ?? 0,
      children: json['children'] ?? 0,
      infants: json['infant'] ?? 0,
      quotationValue: (json['quotation_value'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'COP',
      status: json['status'] ?? '',
      description: json['description'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
```

### **2. Servicios de API**

#### **API Client Base**
```dart
// lib/core/api/api_client.dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  late Dio _dio;
  String? _token;

  void initialize() {
    _dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:8000/api/v1',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_token != null) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await _clearToken();
          // Redirigir a login
        }
        handler.next(error);
      },
    ));
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> _clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  Future<Response> delete(String path) {
    return _dio.delete(path);
  }
}
```

#### **Auth Service**
```dart
// lib/core/auth/auth_service.dart
import '../api/api_client.dart';
import '../models/api_response.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<ApiResponse> login(String email, String password) async {
    try {
      final response = await _apiClient.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        await _apiClient.setToken(data['data']['token']);
        return ApiResponse.fromJson(data);
      } else {
        return ApiResponse.error('Error de autenticación');
      }
    } catch (e) {
      return ApiResponse.error('Error de conexión: $e');
    }
  }

  Future<ApiResponse> logout() async {
    try {
      await _apiClient.post('/auth/logout');
      await _apiClient._clearToken();
      return ApiResponse.success('Sesión cerrada correctamente');
    } catch (e) {
      return ApiResponse.error('Error al cerrar sesión: $e');
    }
  }

  Future<ApiResponse> getCurrentUser() async {
    try {
      final response = await _apiClient.get('/auth/me');
      return ApiResponse.fromJson(response.data);
    } catch (e) {
      return ApiResponse.error('Error al obtener usuario: $e');
    }
  }
}
```

### **3. BLoC para Gestión de Estado**

#### **Clients BLoC**
```dart
// lib/features/clients/bloc/clients_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/client.dart';
import '../services/client_service.dart';

// Events
abstract class ClientsEvent {}

class LoadClients extends ClientsEvent {
  final Map<String, dynamic>? filters;
  LoadClients({this.filters});
}

class SearchClients extends ClientsEvent {
  final String query;
  SearchClients(this.query);
}

class CreateClient extends ClientsEvent {
  final Client client;
  CreateClient(this.client);
}

class UpdateClient extends ClientsEvent {
  final Client client;
  UpdateClient(this.client);
}

class DeleteClient extends ClientsEvent {
  final String clientId;
  DeleteClient(this.clientId);
}

// States
abstract class ClientsState {}

class ClientsInitial extends ClientsState {}

class ClientsLoading extends ClientsState {}

class ClientsLoaded extends ClientsState {
  final List<Client> clients;
  final bool hasMore;
  final int currentPage;
  
  ClientsLoaded({
    required this.clients,
    required this.hasMore,
    required this.currentPage,
  });
}

class ClientsError extends ClientsState {
  final String message;
  ClientsError(this.message);
}

// BLoC
class ClientsBloc extends Bloc<ClientsEvent, ClientsState> {
  final ClientService _clientService = ClientService();

  ClientsBloc() : super(ClientsInitial()) {
    on<LoadClients>(_onLoadClients);
    on<SearchClients>(_onSearchClients);
    on<CreateClient>(_onCreateClient);
    on<UpdateClient>(_onUpdateClient);
    on<DeleteClient>(_onDeleteClient);
  }

  Future<void> _onLoadClients(LoadClients event, Emitter<ClientsState> emit) async {
    emit(ClientsLoading());
    
    try {
      final response = await _clientService.getClients(filters: event.filters);
      
      if (response.success) {
        final clients = (response.data['clients'] as List)
            .map((json) => Client.fromJson(json))
            .toList();
            
        emit(ClientsLoaded(
          clients: clients,
          hasMore: response.data['pagination']['has_more'] ?? false,
          currentPage: response.data['pagination']['current_page'] ?? 1,
        ));
      } else {
        emit(ClientsError(response.message));
      }
    } catch (e) {
      emit(ClientsError('Error al cargar clientes: $e'));
    }
  }

  Future<void> _onSearchClients(SearchClients event, Emitter<ClientsState> emit) async {
    try {
      final response = await _clientService.searchClients(event.query);
      
      if (response.success) {
        final clients = (response.data['clients'] as List)
            .map((json) => Client.fromJson(json))
            .toList();
            
        emit(ClientsLoaded(
          clients: clients,
          hasMore: false,
          currentPage: 1,
        ));
      } else {
        emit(ClientsError(response.message));
      }
    } catch (e) {
      emit(ClientsError('Error al buscar clientes: $e'));
    }
  }

  Future<void> _onCreateClient(CreateClient event, Emitter<ClientsState> emit) async {
    try {
      final response = await _clientService.createClient(event.client);
      
      if (response.success) {
        // Recargar lista de clientes
        add(LoadClients());
      } else {
        emit(ClientsError(response.message));
      }
    } catch (e) {
      emit(ClientsError('Error al crear cliente: $e'));
    }
  }

  Future<void> _onUpdateClient(UpdateClient event, Emitter<ClientsState> emit) async {
    try {
      final response = await _clientService.updateClient(event.client);
      
      if (response.success) {
        // Recargar lista de clientes
        add(LoadClients());
      } else {
        emit(ClientsError(response.message));
      }
    } catch (e) {
      emit(ClientsError('Error al actualizar cliente: $e'));
    }
  }

  Future<void> _onDeleteClient(DeleteClient event, Emitter<ClientsState> emit) async {
    try {
      final response = await _clientService.deleteClient(event.clientId);
      
      if (response.success) {
        // Recargar lista de clientes
        add(LoadClients());
      } else {
        emit(ClientsError(response.message));
      }
    } catch (e) {
      emit(ClientsError('Error al eliminar cliente: $e'));
    }
  }
}
```

### **4. Pantallas de Flutter**

#### **Lista de Clientes**
```dart
// lib/features/clients/screens/clients_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/clients_bloc.dart';
import '../models/client.dart';
import '../widgets/client_card.dart';
import '../widgets/client_search_bar.dart';

class ClientsListScreen extends StatefulWidget {
  @override
  _ClientsListScreenState createState() => _ClientsListScreenState();
}

class _ClientsListScreenState extends State<ClientsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<ClientsBloc>().add(LoadClients());
    
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels == 
        _scrollController.position.maxScrollExtent) {
      // Cargar más clientes si hay más páginas
      final state = context.read<ClientsBloc>().state;
      if (state is ClientsLoaded && state.hasMore) {
        context.read<ClientsBloc>().add(LoadClients());
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Clientes'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () {
              // Navegar a pantalla de crear cliente
            },
          ),
        ],
      ),
      body: Column(
        children: [
          ClientSearchBar(
            controller: _searchController,
            onSearch: (query) {
              if (query.isEmpty) {
                context.read<ClientsBloc>().add(LoadClients());
              } else {
                context.read<ClientsBloc>().add(SearchClients(query));
              }
            },
          ),
          Expanded(
            child: BlocBuilder<ClientsBloc, ClientsState>(
              builder: (context, state) {
                if (state is ClientsLoading) {
                  return Center(child: CircularProgressIndicator());
                } else if (state is ClientsError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error, size: 64, color: Colors.red),
                        SizedBox(height: 16),
                        Text(
                          state.message,
                          style: TextStyle(fontSize: 16),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            context.read<ClientsBloc>().add(LoadClients());
                          },
                          child: Text('Reintentar'),
                        ),
                      ],
                    ),
                  );
                } else if (state is ClientsLoaded) {
                  if (state.clients.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline, size: 64, color: Colors.grey),
                          SizedBox(height: 16),
                          Text(
                            'No hay clientes disponibles',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        ],
                      ),
                    );
                  }
                  
                  return ListView.builder(
                    controller: _scrollController,
                    itemCount: state.clients.length + (state.hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == state.clients.length) {
                        return Center(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }
                      
                      return ClientCard(
                        client: state.clients[index],
                        onTap: () {
                          // Navegar a detalles del cliente
                        },
                        onEdit: () {
                          // Navegar a editar cliente
                        },
                        onDelete: () {
                          _showDeleteDialog(state.clients[index]);
                        },
                      );
                    },
                  );
                }
                
                return SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(Client client) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Eliminar Cliente'),
        content: Text('¿Estás seguro de que quieres eliminar a ${client.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<ClientsBloc>().add(DeleteClient(client.id));
            },
            child: Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
```

### **5. Widgets Personalizados**

#### **Client Card**
```dart
// lib/features/clients/widgets/client_card.dart
import 'package:flutter/material.dart';
import '../models/client.dart';

class ClientCard extends StatelessWidget {
  final Client client;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const ClientCard({
    Key? key,
    required this.client,
    this.onTap,
    this.onEdit,
    this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).primaryColor,
          child: Text(
            client.name.isNotEmpty ? client.name[0].toUpperCase() : '?',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          client.name,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (client.email.isNotEmpty)
              Text(client.email),
            if (client.phone != null && client.phone!.isNotEmpty)
              Text(client.phone!),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            switch (value) {
              case 'edit':
                onEdit?.call();
                break;
              case 'delete':
                onDelete?.call();
                break;
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'edit',
              child: Row(
                children: [
                  Icon(Icons.edit, size: 20),
                  SizedBox(width: 8),
                  Text('Editar'),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, size: 20, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Eliminar', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
          ],
        ),
        onTap: onTap,
      ),
    );
  }
}
```

## 🔧 **Configuración de Laravel para Flutter**

### **Controlador API de Clientes**
```php
// app/Http/Controllers/Api/ClientController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\ClientResource;
use App\Models\Client;
use App\Services\Api\ClientService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    protected $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'status', 'date_from', 'date_to']);
            $perPage = $request->get('per_page', 10);
            $page = $request->get('page', 1);

            $clients = $this->clientService->getClients($filters, $perPage, $page);

            return response()->json([
                'success' => true,
                'data' => [
                    'clients' => ClientResource::collection($clients->items()),
                    'pagination' => [
                        'current_page' => $clients->currentPage(),
                        'total' => $clients->total(),
                        'per_page' => $clients->perPage(),
                        'last_page' => $clients->lastPage(),
                        'has_more' => $clients->hasMorePages(),
                    ],
                ],
                'message' => 'Clientes obtenidos exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'CLIENTS_ERROR',
                    'message' => 'Error al obtener clientes: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:clients,email',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
            ]);

            $client = $this->clientService->createClient($validated);

            return response()->json([
                'success' => true,
                'data' => new ClientResource($client),
                'message' => 'Cliente creado exitosamente',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Los datos proporcionados no son válidos',
                    'details' => $e->errors(),
                ],
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'CLIENT_CREATE_ERROR',
                    'message' => 'Error al crear cliente: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ClientResource($client),
            'message' => 'Cliente obtenido exitosamente',
        ]);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:clients,email,' . $client->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
            ]);

            $client = $this->clientService->updateClient($client, $validated);

            return response()->json([
                'success' => true,
                'data' => new ClientResource($client),
                'message' => 'Cliente actualizado exitosamente',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Los datos proporcionados no son válidos',
                    'details' => $e->errors(),
                ],
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'CLIENT_UPDATE_ERROR',
                    'message' => 'Error al actualizar cliente: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function destroy(Client $client): JsonResponse
    {
        try {
            $this->clientService->deleteClient($client);

            return response()->json([
                'success' => true,
                'message' => 'Cliente eliminado exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'CLIENT_DELETE_ERROR',
                    'message' => 'Error al eliminar cliente: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $clients = $this->clientService->searchClients($query);

            return response()->json([
                'success' => true,
                'data' => [
                    'clients' => ClientResource::collection($clients),
                ],
                'message' => 'Búsqueda completada exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'SEARCH_ERROR',
                    'message' => 'Error en la búsqueda: ' . $e->getMessage(),
                ],
            ], 500);
        }
    }
}
```

---

**Fecha de creación:** 15 de Enero, 2024  
**Versión:** 1.0  
**Autor:** Sistema CRM - MVP Solutions 360  
**Estado:** En revisión
