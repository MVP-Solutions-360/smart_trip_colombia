# 🏗️ Diagramas de Arquitectura - Roles y Permisos

## 📊 Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Sistema CRM"
        subgraph "Roles Globales"
            A[👑 Administrador]
            S[🎯 Supervisor] 
            V[💼 Vendedor]
            C[📊 Contabilidad]
            R[👥 Recursos Humanos]
        end
        
        subgraph "Roles Personalizados"
            RP1[Rol Personalizado 1]
            RP2[Rol Personalizado 2]
            RP3[Rol Personalizado N]
        end
        
        subgraph "Permisos Funcionales"
            P1[🏢 Agencias]
            P2[🏢 Oficinas]
            P3[👥 Personal]
            P4[👤 Usuarios]
            P5[👤 Clientes]
            P6[🧳 Paquetes]
            P7[📄 Cotizaciones]
            P8[💰 Ventas]
            P9[✅ Tareas]
            P10[📊 Reportes]
            P11[⚙️ Configuración]
            P12[🛡️ Roles y Permisos]
        end
        
        subgraph "Permisos de Menú"
            M1[menu_dashboard]
            M2[menu_administracion]
            M3[menu_clientes]
            M4[menu_contabilidad]
            M5[menu_productos]
        end
        
        subgraph "Usuarios"
            U1[Usuario 1]
            U2[Usuario 2]
            U3[Usuario N]
        end
    end
    
    A --> P1
    A --> P2
    A --> P3
    A --> P4
    A --> P5
    A --> P6
    A --> P7
    A --> P8
    A --> P9
    A --> P10
    A --> P11
    A --> P12
    A --> M1
    A --> M2
    A --> M3
    A --> M4
    A --> M5
    
    S --> P2
    S --> P3
    S --> P4
    S --> P5
    S --> P6
    S --> P7
    S --> P8
    S --> P9
    S --> P10
    S --> P11
    S --> P12
    S --> M1
    S --> M2
    S --> M3
    S --> M4
    S --> M5
    
    V --> P5
    V --> P6
    V --> P7
    V --> P8
    V --> P9
    V --> P10
    V --> M1
    V --> M3
    V --> M5
    
    C --> P5
    C --> P6
    C --> P7
    C --> P8
    C --> P9
    C --> P10
    C --> M1
    C --> M3
    C --> M4
    C --> M5
    
    R --> P2
    R --> P3
    R --> P4
    R --> P5
    R --> P9
    R --> P10
    R --> P11
    R --> P12
    R --> M1
    R --> M2
    R --> M3
    
    U1 --> A
    U2 --> V
    U3 --> RP1
    
    RP1 --> P5
    RP1 --> P7
    RP1 --> P8
    RP1 --> M1
    RP1 --> M3
```

## 🔄 Flujo de Asignación de Permisos

```mermaid
flowchart TD
    A[Usuario inicia sesión] --> B{¿Tiene roles asignados?}
    B -->|No| C[Acceso denegado]
    B -->|Sí| D[Obtener roles del usuario]
    D --> E[Obtener permisos de cada rol]
    E --> F[Combinar permisos únicos]
    F --> G[Verificar permisos de menú]
    G --> H[Mostrar menú según permisos]
    H --> I[Usuario navega por el sistema]
    I --> J{¿Accede a funcionalidad?}
    J -->|Sí| K[Verificar permiso funcional]
    J -->|No| L[Continuar navegación]
    K --> M{¿Tiene permiso?}
    M -->|Sí| N[Permitir acceso]
    M -->|No| O[Mostrar error 403]
    N --> L
    O --> L
```

## 🎯 Jerarquía de Roles

```mermaid
graph TD
    subgraph "Nivel 1 - Acceso Completo"
        A[👑 Administrador<br/>Todos los permisos]
    end
    
    subgraph "Nivel 2 - Acceso Casi Completo"
        S[🎯 Supervisor<br/>Casi todos los permisos<br/>❌ Mi Agencia, Gestión Roles, Oficinas]
    end
    
    subgraph "Nivel 3 - Acceso Especializado"
        C[📊 Contabilidad<br/>Financiero + Clientes lectura<br/>❌ Editar clientes]
        R[👥 Recursos Humanos<br/>Administración<br/>❌ Proveedores]
    end
    
    subgraph "Nivel 4 - Acceso Operativo"
        V[💼 Vendedor<br/>Ventas + Clientes<br/>❌ Contabilidad, Productos]
    end
    
    subgraph "Nivel 5 - Roles Personalizados"
        RP[Rol Personalizado<br/>Permisos específicos<br/>Definidos por agencia]
    end
    
    A --> S
    S --> C
    S --> R
    C --> V
    R --> V
    V --> RP
```

## 📋 Matriz de Permisos por Rol

```mermaid
graph LR
    subgraph "Permisos Funcionales"
        P1[🏢 Agencias]
        P2[🏢 Oficinas]
        P3[👥 Personal]
        P4[👤 Usuarios]
        P5[👤 Clientes]
        P6[🧳 Paquetes]
        P7[📄 Cotizaciones]
        P8[💰 Ventas]
        P9[✅ Tareas]
        P10[📊 Reportes]
        P11[⚙️ Configuración]
        P12[🛡️ Roles]
    end
    
    subgraph "Roles"
        A[👑 Admin]
        S[🎯 Supervisor]
        V[💼 Vendedor]
        C[📊 Contabilidad]
        R[👥 RRHH]
    end
    
    A -.->|✅ Todos| P1
    A -.->|✅ Todos| P2
    A -.->|✅ Todos| P3
    A -.->|✅ Todos| P4
    A -.->|✅ Todos| P5
    A -.->|✅ Todos| P6
    A -.->|✅ Todos| P7
    A -.->|✅ Todos| P8
    A -.->|✅ Todos| P9
    A -.->|✅ Todos| P10
    A -.->|✅ Todos| P11
    A -.->|✅ Todos| P12
    
    S -.->|✅ Todos| P2
    S -.->|✅ Todos| P3
    S -.->|✅ Todos| P4
    S -.->|✅ Todos| P5
    S -.->|✅ Todos| P6
    S -.->|✅ Todos| P7
    S -.->|✅ Todos| P8
    S -.->|✅ Todos| P9
    S -.->|✅ Todos| P10
    S -.->|✅ Todos| P11
    S -.->|✅ Todos| P12
    S -.->|❌ Sin acceso| P1
    
    V -.->|✅ Todos| P5
    V -.->|✅ Ver| P6
    V -.->|✅ Todos| P7
    V -.->|✅ Todos| P8
    V -.->|✅ Básicos| P9
    V -.->|✅ Ventas| P10
    V -.->|❌ Sin acceso| P1
    V -.->|❌ Sin acceso| P2
    V -.->|❌ Sin acceso| P3
    V -.->|❌ Sin acceso| P4
    V -.->|❌ Sin acceso| P11
    V -.->|❌ Sin acceso| P12
    
    C -.->|✅ Ver| P5
    C -.->|✅ Ver| P6
    C -.->|✅ Ver| P7
    C -.->|✅ Ver| P8
    C -.->|✅ Básicos| P9
    C -.->|✅ Todos| P10
    C -.->|❌ Sin acceso| P1
    C -.->|❌ Sin acceso| P2
    C -.->|❌ Sin acceso| P3
    C -.->|❌ Sin acceso| P4
    C -.->|❌ Sin acceso| P11
    C -.->|❌ Sin acceso| P12
    
    R -.->|✅ Todos| P2
    R -.->|✅ Todos| P3
    R -.->|✅ Todos| P4
    R -.->|✅ Todos| P5
    R -.->|✅ Básicos| P9
    R -.->|✅ Personal| P10
    R -.->|✅ Básicos| P11
    R -.->|✅ Todos| P12
    R -.->|❌ Sin acceso| P1
    R -.->|❌ Sin acceso| P6
    R -.->|❌ Sin acceso| P7
    R -.->|❌ Sin acceso| P8
```

## 🔐 Flujo de Autenticación y Autorización

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as Sistema
    participant DB as Base de Datos
    participant C as Cache
    participant UI as Interfaz
    
    U->>S: Inicia sesión
    S->>DB: Verificar credenciales
    DB-->>S: Usuario válido
    S->>DB: Obtener roles del usuario
    DB-->>S: Lista de roles
    S->>DB: Obtener permisos de cada rol
    DB-->>S: Lista de permisos
    S->>C: Guardar en cache
    S->>UI: Generar menú según permisos
    UI-->>U: Mostrar interfaz personalizada
    
    U->>UI: Hace clic en opción de menú
    UI->>S: Verificar permiso de menú
    S->>C: Consultar cache de permisos
    C-->>S: Permisos del usuario
    S-->>UI: Resultado de verificación
    
    alt Usuario tiene permiso
        UI-->>U: Mostrar funcionalidad
    else Usuario no tiene permiso
        UI-->>U: Mostrar error 403
    end
    
    U->>UI: Intenta realizar acción
    UI->>S: Verificar permiso funcional
    S->>C: Consultar cache de permisos
    C-->>S: Permisos del usuario
    
    alt Usuario tiene permiso
        S-->>UI: Permitir acción
        UI-->>U: Ejecutar acción
    else Usuario no tiene permiso
        S-->>UI: Denegar acción
        UI-->>U: Mostrar error 403
    end
```

## 📊 Estadísticas del Sistema

```mermaid
pie title Distribución de Permisos por Categoría
    "Menú del Sistema" : 20
    "Agencias" : 4
    "Oficinas" : 5
    "Personal" : 5
    "Usuarios" : 5
    "Clientes" : 5
    "Paquetes" : 6
    "Cotizaciones" : 6
    "Ventas" : 6
    "Tareas" : 6
    "Reportes" : 5
    "Configuración" : 4
    "Roles y Permisos" : 6
```

## 🎨 Colores y Iconos del Sistema

```mermaid
graph LR
    subgraph "Colores de Roles"
        A[👑 Administrador<br/>🔴 #DC2626]
        S[🎯 Supervisor<br/>🟢 #10B981]
        V[💼 Vendedor<br/>🔵 #3B82F6]
        C[📊 Contabilidad<br/>🟠 #F59E0B]
        R[👥 Recursos Humanos<br/>🟣 #8B5CF6]
    end
    
    subgraph "Colores de Categorías"
        P1[🏢 Agencias<br/>🔵 #3B82F6]
        P2[🏢 Oficinas<br/>🟢 #10B981]
        P3[👥 Personal<br/>🟠 #F59E0B]
        P4[👤 Usuarios<br/>🟣 #8B5CF6]
        P5[👤 Clientes<br/>🔵 #06B6D4]
        P6[🧳 Paquetes<br/>🔴 #EF4444]
        P7[📄 Cotizaciones<br/>🟢 #84CC16]
        P8[💰 Ventas<br/>🟠 #F97316]
        P9[✅ Tareas<br/>🟣 #EC4899]
        P10[📊 Reportes<br/>🔵 #6366F1]
        P11[⚙️ Configuración<br/>🔘 #6B7280]
        P12[🛡️ Roles<br/>🔴 #DC2626]
    end
```

---

**📝 Diagramas generados con Mermaid**  
**🕒 Última actualización:** {{ date('Y-m-d H:i:s') }}  
**👨‍💻 Sistema CRM - Versión 1.0**
