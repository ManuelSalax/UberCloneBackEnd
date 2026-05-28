const openapiSpecification = {
  openapi: "3.0.3",
  info: {
    title: "UberClone API Documentation",
    description: "Especificación completa y producción-lista para el Backend de UberClone.",
    version: "1.0.0",
    contact: {
      name: "Soporte de Desarrollo UberClone",
      email: "soporte@uberclone.local",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Servidor Local de Desarrollo",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Ingresa el token JWT en formato: `Bearer <token>`",
      },
    },
    schemas: {
      StandardError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Descripción del error." },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Must be a valid email address" },
              },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "647214baecfbdc001f35f299" },
          fullName: { type: "string", example: "Manuel Lopez" },
          email: { type: "string", example: "manuel@example.com" },
          phone: { type: "string", example: "+573001234567" },
          gender: { type: "string", enum: ["Male", "Female", "Other"], example: "Male" },
          language: { type: "string", example: "es" },
          role: { type: "string", enum: ["PASSENGER", "DRIVER", "ADMIN"], example: "PASSENGER" },
          profileImage: { type: "string", example: "https://example.com/profiles/manuel.jpg" },
          isActive: { type: "boolean", example: true },
        },
      },
      Driver: {
        type: "object",
        properties: {
          id: { type: "string", example: "647214baecfbdc001f35f3aa" },
          userId: { type: "string", example: "647214baecfbdc001f35f299" },
          vehicleBrand: { type: "string", example: "Toyota" },
          vehicleModel: { type: "string", example: "Corolla" },
          vehiclePlate: { type: "string", example: "XYZ123" },
          vehicleColor: { type: "string", example: "Gris" },
          vehicleType: { type: "string", enum: ["Economy", "XL", "Premium"], example: "Economy" },
          licenseNumber: { type: "string", example: "LIC98765432" },
          rating: { type: "number", example: 4.8 },
          isAvailable: { type: "boolean", example: true },
          currentLocation: {
            type: "object",
            properties: {
              latitude: { type: "number", example: 4.60971 },
              longitude: { type: "number", example: -74.08175 },
            },
          },
        },
      },
      Trip: {
        type: "object",
        properties: {
          id: { type: "string", example: "647214baecfbdc001f35f4bb" },
          passenger: { type: "string", example: "647214baecfbdc001f35f299" },
          driver: { type: "string", nullable: true, example: "647214baecfbdc001f35f3aa" },
          pickupLocation: { type: "string", example: "Parque de la 93, Bogotá" },
          destinationLocation: { type: "string", example: "Centro Comercial Andino, Bogotá" },
          pickupCoordinates: {
            type: "object",
            properties: {
              latitude: { type: "number", example: 4.676 },
              longitude: { type: "number", example: -74.048 },
            },
          },
          destinationCoordinates: {
            type: "object",
            properties: {
              latitude: { type: "number", example: 4.667 },
              longitude: { type: "number", example: -74.055 },
            },
          },
          distance: { type: "number", example: 2.5 },
          duration: { type: "number", example: 10 },
          fare: { type: "number", example: 8000 },
          vehicleType: { type: "string", enum: ["Economy", "XL", "Premium"], example: "Economy" },
          status: {
            type: "string",
            enum: ["Pending", "Accepted", "DriverAssigned", "InProgress", "Completed", "Cancelled"],
            example: "Pending",
          },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "string", example: "647214baecfbdc001f35f5cc" },
          tripId: { type: "string", example: "647214baecfbdc001f35f4bb" },
          userId: { type: "string", example: "647214baecfbdc001f35f299" },
          amount: { type: "number", example: 8000 },
          currency: { type: "string", example: "COP" },
          paymentMethod: { type: "string", example: "Mercado Pago" },
          status: { type: "string", enum: ["Pending", "Approved", "Rejected", "Cancelled"], example: "Pending" },
          mercadoPagoPreferenceId: { type: "string", example: "pref_mock_12345" },
          mercadoPagoPaymentId: { type: "string", example: "mock_pay_98765" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Registrar un nuevo usuario",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password", "phone", "gender"],
                properties: {
                  fullName: { type: "string", example: "Manuel Lopez" },
                  email: { type: "string", example: "manuel@example.com" },
                  password: { type: "string", example: "password123" },
                  phone: { type: "string", example: "+573001234567" },
                  gender: { type: "string", enum: ["Male", "Female", "Other"], example: "Male" },
                  language: { type: "string", example: "es" },
                  role: { type: "string", enum: ["PASSENGER", "DRIVER"], example: "PASSENGER" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario creado exitosamente.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User registered successfully" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: { description: "Email ya registrado o payload inválido.", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardError" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Iniciar sesión de usuario",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "manuel@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Sesión exitosa, se genera token JWT.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Login successful" },
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsIn..." },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Credenciales inválidas.", content: { "application/json": { schema: { $ref: "#/components/schemas/StandardError" } } } },
        },
      },
    },
    "/api/users/profile": {
      get: {
        summary: "Obtener perfil del usuario autenticado",
        tags: ["Profile"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Perfil de usuario.",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/User" } } } } },
          },
          401: { description: "Token inválido o ausente." },
        },
      },
      put: {
        summary: "Actualizar perfil del usuario autenticado",
        tags: ["Profile"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  phone: { type: "string" },
                  gender: { type: "string" },
                  language: { type: "string" },
                  profileImage: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Perfil actualizado exitosamente." },
        },
      },
    },
    "/api/drivers": {
      post: {
        summary: "Registrar perfil como conductor",
        tags: ["Drivers"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["vehicleBrand", "vehicleModel", "vehiclePlate", "vehicleColor", "vehicleType", "licenseNumber"],
                properties: {
                  vehicleBrand: { type: "string", example: "Toyota" },
                  vehicleModel: { type: "string", example: "Corolla" },
                  vehiclePlate: { type: "string", example: "XYZ123" },
                  vehicleColor: { type: "string", example: "Gris" },
                  vehicleType: { type: "string", enum: ["Economy", "XL", "Premium"], example: "Economy" },
                  licenseNumber: { type: "string", example: "LIC98765432" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Conductor registrado exitosamente.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, driver: { $ref: "#/components/schemas/Driver" } } } } } },
        },
      },
      get: {
        summary: "Consultar lista de conductores",
        tags: ["Drivers"],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "isAvailable", in: "query", schema: { type: "boolean" }, description: "Filtrar por disponibilidad" },
          { name: "vehicleType", in: "query", schema: { type: "string" }, description: "Filtrar por gama de auto" },
        ],
        responses: {
          200: { description: "Lista de conductores." },
        },
      },
    },
    "/api/drivers/{id}": {
      get: {
        summary: "Obtener un conductor por ID",
        tags: ["Drivers"],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Perfil de conductor." },
        },
      },
      put: {
        summary: "Actualizar perfil de conductor por ID",
        tags: ["Drivers"],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { isAvailable: { type: "boolean" } } } } },
        },
        responses: {
          200: { description: "Perfil de conductor actualizado." },
        },
      },
    },
    "/api/trips": {
      post: {
        summary: "Solicitar un viaje nuevo",
        tags: ["Trips"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["pickupLocation", "destinationLocation", "pickupCoordinates", "destinationCoordinates", "vehicleType"],
                properties: {
                  pickupLocation: { type: "string", example: "Parque de la 93" },
                  destinationLocation: { type: "string", example: "Andino" },
                  pickupCoordinates: { type: "object", properties: { latitude: { type: "number", example: 4.676 }, longitude: { type: "number", example: -74.048 } } },
                  destinationCoordinates: { type: "object", properties: { latitude: { type: "number", example: 4.667 }, longitude: { type: "number", example: -74.055 } } },
                  vehicleType: { type: "string", example: "Economy" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Viaje creado.", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, trip: { $ref: "#/components/schemas/Trip" } } } } } },
        },
      },
      get: {
        summary: "Listar viajes del sistema",
        tags: ["Trips"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Lista de viajes." },
        },
      },
    },
    "/api/trips/history": {
      get: {
        summary: "Consultar historial de viajes filtrado por el usuario autenticado",
        tags: ["Trips"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Historial de viajes del pasajero/conductor." },
        },
      },
    },
    "/api/trips/{id}": {
      get: {
        summary: "Obtener un viaje por ID",
        tags: ["Trips"],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Detalles del viaje." },
        },
      },
      put: {
        summary: "Actualizar estado o conductor de un viaje por ID",
        tags: ["Trips"],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, driverId: { type: "string" } } } } },
        },
        responses: {
          200: { description: "Viaje actualizado." },
        },
      },
      delete: {
        summary: "Cancelar un viaje por ID",
        tags: ["Trips"],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Viaje cancelado (estado: Cancelled)." },
        },
      },
    },
    "/api/maps/autocomplete": {
      get: {
        summary: "Autocompletar dirección por texto",
        tags: ["Maps"],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "input", in: "query", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Sugerencias de dirección." },
        },
      },
    },
    "/api/maps/directions": {
      get: {
        summary: "Obtener ruta entre origen y destino",
        tags: ["Maps"],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "origin", in: "query", required: true, schema: { type: "string" }, description: "lat,lng o dirección" },
          { name: "destination", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Información de ruta." },
        },
      },
    },
    "/api/maps/distance": {
      get: {
        summary: "Calcular distancia, duración y cotizar tarifa",
        tags: ["Maps"],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "origin", in: "query", required: true, schema: { type: "string" } },
          { name: "destination", in: "query", required: true, schema: { type: "string" } },
          { name: "vehicleType", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Cotización del viaje.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    distance: { type: "string", example: "8.4 km" },
                    duration: { type: "string", example: "22 min" },
                    fare: { type: "number", example: 15000 },
                    fares: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/payments/create": {
      post: {
        summary: "Iniciar pasarela de pago para un viaje",
        tags: ["Payments"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["tripId"], properties: { tripId: { type: "string" } } } } },
        },
        responses: {
          201: { description: "Preferencia de pago creada.", content: { "application/json": { schema: { type: "object", properties: { preferenceId: { type: "string" }, initPoint: { type: "string" } } } } } },
        },
      },
    },
    "/api/payments/{id}": {
      get: {
        summary: "Consultar registro de pago por ID",
        tags: ["Payments"],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Detalles del pago." },
        },
      },
    },
    "/api/payments/webhook": {
      post: {
        summary: "Webhook de notificaciones de Mercado Pago (IPN)",
        tags: ["Payments"],
        parameters: [
          { name: "type", in: "query", schema: { type: "string" } },
          { name: "data.id", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Notificación recibida." },
        },
      },
    },
    "/api/admin/users": {
      get: {
        summary: "Listado de usuarios en el sistema (ADMIN)",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Lista de todos los usuarios." },
        },
      },
    },
    "/api/admin/trips": {
      get: {
        summary: "Listado de todos los viajes (ADMIN)",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Lista de todos los viajes." },
        },
      },
    },
    "/api/admin/payments": {
      get: {
        summary: "Listado de todos los pagos (ADMIN)",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Lista de todos los pagos." },
        },
      },
    },
  },
};

const renderSwaggerUI = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UberClone API - Swagger Documentation</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css" />
      <style>
        html { box-sizing: border-box; overflow: -y-scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; font-family: 'Outfit', sans-serif; }
        .swagger-ui .topbar { display: none; }
        .header-custom {
          background-color: #000000;
          color: white;
          padding: 24px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #009ee3;
        }
        .header-custom h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
        .badge {
          background-color: #009ee3;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="header-custom">
        <h1>UberClone API <span style="color:#009ee3;">Console</span></h1>
        <div class="badge">v1.0.0 Stable</div>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            spec: ${JSON.stringify(openapiSpecification)},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "BaseLayout"
          });
          window.ui = ui;
        };
      </script>
    </body>
    </html>
  `);
};

module.exports = {
  openapiSpecification,
  renderSwaggerUI,
};
