# Arquitectura y Diseño del Sistema UberClone API

Este documento contiene la arquitectura de capas, modelos de datos, flujos de secuencia y diagramas de entidad-relación de la API de **UberClone**.

---

## 1. Diagrama Entidad-Relación (ERD)

El siguiente diagrama detalla la relación lógica entre las colecciones de la base de datos de MongoDB Atlas.

```mermaid
erDiagram
    USER {
        ObjectId id PK
        String fullName
        String email UK
        String password
        String phone
        String gender
        String language
        String profileImage
        String role "PASSENGER | DRIVER | ADMIN"
        Boolean isActive
        Date createdAt
    }
    
    DRIVER {
        ObjectId id PK
        ObjectId userId FK "Relación 1:1 con User"
        String vehicleBrand
        String vehicleModel
        String vehiclePlate UK
        String vehicleColor
        String vehicleType "Economy | XL | Premium"
        String licenseNumber UK
        Number rating "Rango 1-5"
        Boolean isAvailable
        Object currentLocation "latitude, longitude"
    }

    TRIP {
        ObjectId id PK
        ObjectId passenger FK "Relación M:1 con User"
        ObjectId driver FK "Relación M:1 con Driver (Opcional)"
        String pickupLocation
        String destinationLocation
        Object pickupCoordinates "lat, lng"
        Object destinationCoordinates "lat, lng"
        Number distance "en Km"
        Number duration "en Minutos"
        Number fare "COP"
        String vehicleType "Economy | XL | Premium"
        String status "Pending | Accepted | DriverAssigned | InProgress | Completed | Cancelled"
    }

    PAYMENT {
        ObjectId id PK
        ObjectId tripId FK "Relación 1:1 con Trip"
        ObjectId userId FK "Relación M:1 con User (Pasajero)"
        Number amount
        String currency "default COP"
        String paymentMethod "default Mercado Pago"
        String status "Pending | Approved | Rejected | Cancelled"
        String mercadoPagoPreferenceId
        String mercadoPagoPaymentId
    }

    USER ||--|| DRIVER : "posee (si es DRIVER)"
    USER ||--o{ TRIP : "solicita (como Pasajero)"
    DRIVER ||--o{ TRIP : "realiza (como Conductor)"
    TRIP ||--|| PAYMENT : "se liquida con"
    USER ||--o{ PAYMENT : "paga"
```

---

## 2. Flujo de un Viaje (Secuencia)

A continuación se ilustra el ciclo de vida completo de un viaje solicitado por el pasajero y aceptado por el conductor, finalizando con el pago.

```mermaid
sequenceDiagram
    autonumber
    actor Pasajero
    actor Conductor
    participant API as UberClone API
    participant Maps as Google Maps Service
    participant MP as Mercado Pago Service

    Pasajero->>API: Autocomplete / Cotizar Ruta (origin, destination)
    API->>Maps: Calcular Distancia y Duración (Distance Matrix)
    Maps-->>API: Distancia en Km y Tiempo
    API->>API: Calcular Tarifa (Economy, XL, Premium)
    API-->>Pasajero: Opciones de Tarifa y Distancia

    Pasajero->>API: POST /api/trips (Solicitar Viaje)
    API->>API: Crear Trip en estado 'Pending'
    API-->>Pasajero: Retorna Trip creado

    Conductor->>API: PUT /api/trips/:id (Aceptar Viaje)
    API->>API: Asignar Conductor y actualizar estado a 'Accepted'
    API-->>Conductor: Confirmación de Viaje Asignado
    API-->>Pasajero: Notificar Conductor en camino

    Conductor->>API: PUT /api/trips/:id (status: 'InProgress')
    API->>API: Actualizar estado de viaje en curso
    API-->>Conductor: Viaje en curso

    Conductor->>API: PUT /api/trips/:id (status: 'Completed' / Llegada)
    API->>API: Marcar llegada a destino

    Pasajero->>API: POST /api/payments/create (Iniciar Pago)
    API->>MP: Crear Preferencia de Pago (tripId, fare)
    MP-->>API: Preference ID e init_point (Checkout URL)
    API->>API: Registrar Payment en estado 'Pending'
    API-->>Pasajero: Retorna URL de checkout de Mercado Pago

    Pasajero->>MP: Realizar Pago en Checkout
    MP->>API: Notificación Webhook (IPN / Webhook POST)
    API->>MP: Consultar Estado del Pago (Payment ID)
    MP-->>API: Estado de pago: 'approved'
    API->>API: Actualizar Payment local a 'Approved'
    API->>API: Marcar Trip local como 'Completed' y liquidado
    API-->>MP: HTTP 200 (OK)
```

---

## 3. Arquitectura de Capas Utilizada

El diseño de software sigue estrictamente una arquitectura por capas desacoplada:

1. **Modelos (Mongoose):** Definen la estructura estricta de las entidades y se comunican con MongoDB Atlas.
2. **Servicios (`/services`):** Encapsulan la lógica de negocios aislada y la integración con APIs de terceros (Google Maps SDK, Mercado Pago SDK). Cuentan con un diseño robusto de **Mocks fallback** para permitir el desarrollo continuo y pruebas locales completas sin depender de claves de API externas vigentes.
3. **Controladores (`/controllers`):** Coordinan los flujos HTTP de entrada y salida, procesando la solicitud, invocando la lógica de negocio y enviando respuestas estandarizadas.
4. **Middlewares (`/middlewares`):** Capas intermedias que resuelven autenticación (JWT), control de accesos por roles (Role Authorization), validaciones sintácticas con `express-validator` y manejo centralizado de excepciones (Error Middleware).
5. **Rutas (`/routes`):** Exponen los endpoints de la API y orquestan qué middlewares y controladores responden a cada verbo HTTP.
