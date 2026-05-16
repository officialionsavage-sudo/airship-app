/** OpenAPI 3 document for Swagger UI (`/api-docs`). Keep in sync with route handlers. */
export const openapiSpecification = {
  openapi: '3.0.3',
  info: {
    title: 'AirShip API',
    version: '0.0.1',
    description:
      'Public REST API for cities, real-estate projects, tours, offers, transfer/car fleet, CMS reads, and booking/contact/review submissions. Images are stored as base64 / data URIs in Postgres. Protected CMS/catalog/inbound CRUD lives under `/api/admin` (HTTP Basic `ADMIN_USERNAME` + `ADMIN_PASSWORD` when username is configured; otherwise Bearer legacy secret); see the Admin tag and route modules under `AirShipBackend/src/routes/admin/`.',
  },
  servers: [{ url: '/', description: 'Same host as this API (e.g. http://localhost:3000)' }],
  tags: [
    { name: 'Health', description: 'Liveness' },
    { name: 'Cities', description: 'Cities and nested lists' },
    { name: 'Projects', description: 'Projects and units' },
    { name: 'Tours', description: 'Tours under cities' },
    { name: 'Offers', description: 'Promotional offers' },
    { name: 'Cars', description: 'Transfer / car rental fleet (public picker)' },
    { name: 'Site', description: 'Approved reviews and CMS keys' },
    { name: 'Inquiries', description: 'Form submissions' },
    {
      name: 'Admin',
      description:
        'Authenticated CRUD (HTTP Basic user + password when env `ADMIN_USERNAME` is set; otherwise Bearer token equal to `ADMIN_PASSWORD`, or headers `X-Admin-Password` / legacy `X-Admin-Key`). JSON bodies up to ~15 MB on /api/admin for catalog images. Full route list is under AirShipBackend/src/routes/admin/.',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthOk' } } } } },
      },
    },
    '/api/cities': {
      get: {
        tags: ['Cities'],
        summary: 'List cities',
        responses: {
          '200': {
            description: 'City cards',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/City' } } } },
          },
        },
      },
    },
    '/api/cities/{slug}': {
      get: {
        tags: ['Cities'],
        summary: 'City by slug',
        parameters: [{ $ref: '#/components/parameters/Slug' }],
        responses: {
          '200': { description: 'City', content: { 'application/json': { schema: { $ref: '#/components/schemas/City' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/cities/{slug}/location-filters': {
      get: {
        tags: ['Cities'],
        summary: 'Location filters for city (merged from all projects in that city)',
        parameters: [{ $ref: '#/components/parameters/Slug' }],
        responses: {
          '200': {
            description: 'Filters',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CatalogListingFilter' } } } },
          },
          '404': { description: 'City not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/cities/{slug}/tour-type-filters': {
      get: {
        tags: ['Cities'],
        summary: 'Tour type filter buckets for this listing market (city slug)',
        parameters: [{ $ref: '#/components/parameters/Slug' }],
        responses: {
          '200': {
            description: 'Filters',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CatalogListingFilter' } } } },
          },
          '404': { description: 'City not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/cities/{citySlug}/projects': {
      get: {
        tags: ['Cities'],
        summary: 'Projects in city',
        parameters: [{ $ref: '#/components/parameters/CitySlug' }],
        responses: {
          '200': {
            description: 'Projects with nested units',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } },
          },
        },
      },
    },
    '/api/cities/{citySlug}/projects/{projectSlug}': {
      get: {
        tags: ['Cities'],
        summary: 'Project detail (city must match)',
        parameters: [{ $ref: '#/components/parameters/CitySlug' }, { $ref: '#/components/parameters/ProjectSlug' }],
        responses: {
          '200': { description: 'Project', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/cities/{citySlug}/tours': {
      get: {
        tags: ['Tours'],
        summary: 'Tours in city',
        parameters: [
          { $ref: '#/components/parameters/CitySlug' },
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['sea', 'desert', 'island', 'city', 'adventure', 'wellness'] },
          },
        ],
        responses: {
          '200': {
            description: 'Tours',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Tour' } } } },
          },
        },
      },
    },
    '/api/cities/{citySlug}/tours/{tourSlug}': {
      get: {
        tags: ['Tours'],
        summary: 'Tour detail',
        parameters: [{ $ref: '#/components/parameters/CitySlug' }, { $ref: '#/components/parameters/TourSlug' }],
        responses: {
          '200': { description: 'Tour', content: { 'application/json': { schema: { $ref: '#/components/schemas/Tour' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        parameters: [{ name: 'city', in: 'query', required: false, schema: { type: 'string' }, description: 'Filter by city slug' }],
        responses: {
          '200': {
            description: 'Projects',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } },
          },
        },
      },
    },
    '/api/projects/{slug}': {
      get: {
        tags: ['Projects'],
        summary: 'Project by slug',
        parameters: [
          { $ref: '#/components/parameters/ProjectSlugPath' },
          {
            name: 'citySlug',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'If set, must match project city or 404',
          },
        ],
        responses: {
          '200': { description: 'Project', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{projectSlug}/units': {
      get: {
        tags: ['Projects'],
        summary: 'Units in project',
        parameters: [{ $ref: '#/components/parameters/ProjectSlugParam' }],
        responses: {
          '200': {
            description: 'Units',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Unit' } } } },
          },
          '404': { description: 'Project not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/projects/{projectSlug}/units/{unitSlug}': {
      get: {
        tags: ['Projects'],
        summary: 'Unit detail',
        parameters: [{ $ref: '#/components/parameters/ProjectSlugParam' }, { $ref: '#/components/parameters/UnitSlug' }],
        responses: {
          '200': { description: 'Unit', content: { 'application/json': { schema: { $ref: '#/components/schemas/Unit' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/offers': {
      get: {
        tags: ['Offers'],
        summary: 'List offers',
        responses: {
          '200': {
            description: 'Offers',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Offer' } } } },
          },
        },
      },
    },
    '/api/offers/{id}': {
      get: {
        tags: ['Offers'],
        summary: 'Get offer by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Offer',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Offer' } } },
          },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/vehicle-types': {
      get: {
        tags: ['Cars'],
        summary: 'Vehicle type labels for airport transfer form',
        responses: {
          '200': {
            description: 'Ordered rows',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/VehicleTypePublic' } },
              },
            },
          },
        },
      },
    },
    '/api/cars': {
      get: {
        tags: ['Cars'],
        summary: 'List cars / fleet for transfers page',
        responses: {
          '200': {
            description: 'Ordered fleet rows',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CarPublic' } } } },
          },
        },
      },
    },
    '/api/site-content/{key}': {
      get: {
        tags: ['Site'],
        summary: 'CMS JSON payload by key',
        parameters: [
          { name: 'key', in: 'path', required: true, schema: { type: 'string' } },
          {
            name: 'Accept-Language',
            in: 'header',
            required: false,
            schema: { type: 'string', example: 'en' },
            description: 'For `home` key: picks localized branch when payload uses `{ version: 2, locales: { … } }`.',
          },
        ],
        responses: {
          '200': { description: 'Arbitrary JSON', content: { 'application/json': { schema: {} } } },
          '404': { description: 'Missing key', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/site-settings': {
      get: {
        tags: ['Site'],
        summary: 'Key/value settings map',
        responses: {
          '200': {
            description: 'Record string → string',
            content: { 'application/json': { schema: { type: 'object', additionalProperties: { type: 'string' } } } },
          },
        },
      },
    },
    '/api/bookings': {
      post: {
        tags: ['Inquiries'],
        summary: 'Submit booking inquiry',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingRequest' } } },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingResponse' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: {} } } },
        },
      },
    },
    '/api/contact': {
      post: {
        tags: ['Inquiries'],
        summary: 'Submit contact message',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactRequest' } } },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactResponse' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: {} } } },
        },
      },
    },
    '/api/reviews': {
      get: {
        tags: ['Site'],
        summary: 'Approved reviews (public)',
        parameters: [
          {
            name: 'targetType',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['app', 'service', 'tour', 'project'] },
            description: 'Filter by target; home page uses `app`.',
          },
        ],
        responses: {
          '200': {
            description: 'Approved reviews only (no email)',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/PublicReview' } },
              },
            },
          },
          '400': { description: 'Invalid targetType', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Inquiries'],
        summary: 'Submit review (pending moderation)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewRequest' } } },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewResponse' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: {} } } },
        },
      },
    },
    '/api/admin/site-content': {
      get: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'List CMS keys',
        responses: {
          '200': { description: 'SiteContent rows' },
          '401': { description: 'Unauthorized' },
          '503': {
            description:
              'ADMIN_PASSWORD or legacy ADMIN_API_KEY not configured (Basic auth additionally requires ADMIN_USERNAME)',
          },
        },
      },
    },
    '/api/admin/site-content/{key}': {
      get: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'Get CMS payload',
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'SiteContent row' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'Upsert CMS payload',
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { payload: {} }, required: ['payload'] },
            },
          },
        },
        responses: { '200': { description: 'Updated row' } },
      },
      delete: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'Delete CMS key',
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' } },
      },
    },
    '/api/admin/cities': {
      get: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'List cities (Prisma raw)',
        responses: { '200': { description: 'City rows' } },
      },
      post: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'Create city',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/admin/projects/{id}': {
      get: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'Project detail with units',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Project + nested units' } },
      },
    },
    '/api/admin/tours': {
      post: {
        tags: ['Admin'],
        security: [{ AdminBearer: [] }, { AdminBasic: [] }],
        summary: 'Create tour (+ prices)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Created tour' } },
      },
    },
  },
  components: {
    securitySchemes: {
      AdminBearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'ADMIN_PASSWORD',
        description:
          'Use only when ADMIN_USERNAME is unset: same value as env ADMIN_PASSWORD (legacy: ADMIN_API_KEY)',
      },
      AdminBasic: {
        type: 'http',
        scheme: 'basic',
        description: 'When ADMIN_USERNAME is set: username = ADMIN_USERNAME, password = ADMIN_PASSWORD (or ADMIN_API_KEY)',
      },
    },
    parameters: {
      Slug: { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'City slug' },
      CitySlug: { name: 'citySlug', in: 'path', required: true, schema: { type: 'string' } },
      ProjectSlug: { name: 'projectSlug', in: 'path', required: true, schema: { type: 'string' } },
      ProjectSlugPath: { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'Project slug' },
      ProjectSlugParam: { name: 'projectSlug', in: 'path', required: true, schema: { type: 'string' } },
      TourSlug: { name: 'tourSlug', in: 'path', required: true, schema: { type: 'string' } },
      UnitSlug: { name: 'unitSlug', in: 'path', required: true, schema: { type: 'string' } },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      HealthOk: {
        type: 'object',
        properties: { ok: { type: 'boolean', example: true } },
      },
      CityPortalCard: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' },
        },
      },
      City: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          shortDescription: { type: 'string' },
          image: { type: 'string', description: 'Renderable src (data URI or legacy path)' },
          heroImage: { type: 'string' },
          isComingSoon: { type: 'boolean' },
          portals: {
            type: 'object',
            properties: {
              realEstate: { $ref: '#/components/schemas/CityPortalCard' },
              tours: { $ref: '#/components/schemas/CityPortalCard' },
              transport: { $ref: '#/components/schemas/CityPortalCard' },
            },
          },
        },
      },
      CatalogListingFilter: {
        type: 'object',
        properties: { title: { type: 'string' }, slug: { type: 'string' } },
        description: 'City-scoped listing filter label; assignments live on each project/tour.',
      },
      UnitDiscounts: {
        type: 'object',
        properties: { day: { type: 'integer' }, week: { type: 'integer' }, month: { type: 'integer' } },
      },
      Unit: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          projectSlug: { type: 'string' },
          title: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          size: { type: 'number' },
          beds: { type: 'integer' },
          baths: { type: 'integer' },
          description: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          pricePerDay: { type: 'integer' },
          pricePerWeek: { type: 'integer' },
          pricePerMonth: { type: 'integer' },
          discounts: { $ref: '#/components/schemas/UnitDiscounts' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          citySlug: { type: 'string' },
          title: { type: 'string' },
          startingPrice: { type: 'integer', nullable: true },
          locationName: { type: 'string' },
          locationSlug: { type: 'string' },
          status: { type: 'string', enum: ['launching', 'under-construction', 'ready'] },
          propertyType: { type: 'string', enum: ['apartment', 'villa', 'townhouse', 'chalet', 'studio'] },
          description: { type: 'string' },
          shortDescription: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          heroImage: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          amenities: { type: 'array', items: { type: 'string' } },
          developerName: { type: 'string' },
          deliveryDate: { type: 'string' },
          mapEmbedUrl: { type: 'string' },
          videoUrl: { type: 'string' },
          catalogFilterSlugs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Assigned real-estate catalog filter slugs for the city listing.',
          },
          units: { type: 'array', items: { $ref: '#/components/schemas/Unit' } },
        },
      },
      TourPrice: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          amount: { type: 'integer' },
          discountPercent: { type: 'integer' },
        },
      },
      Tour: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          citySlug: { type: 'string' },
          title: { type: 'string' },
          type: { type: 'string' },
          rating: { type: 'number' },
          startPrice: { type: 'integer' },
          duration: { type: 'string' },
          departureTime: { type: 'string' },
          groupSize: { type: 'string' },
          overview: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          itinerary: { type: 'array', items: { type: 'string' } },
          included: { type: 'array', items: { type: 'string' } },
          notIncluded: { type: 'array', items: { type: 'string' } },
          prices: { type: 'array', items: { $ref: '#/components/schemas/TourPrice' } },
          catalogFilterSlugs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Assigned tour catalog filter slugs for the city listing.',
          },
        },
      },
      Offer: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          oldPrice: { type: 'integer' },
          newPrice: { type: 'integer' },
          discountPercent: { type: 'integer' },
          highlights: { type: 'array', items: { type: 'string' } },
          features: { type: 'array', items: { type: 'string' } },
          included: { type: 'array', items: { type: 'string' } },
          notIncluded: { type: 'array', items: { type: 'string' } },
          terms: { type: 'string', nullable: true },
          validUntil: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      VehicleTypePublic: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          sortOrder: { type: 'integer' },
        },
      },
      CarPublic: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          passengers: { type: 'integer' },
          luggage: { type: 'integer' },
          pricePerDay: { type: 'integer' },
          image: { type: 'string', description: 'Data URI, absolute URL, or site-relative path' },
        },
      },
      PublicReview: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          citySlug: { type: 'string' },
          text: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          role: { type: 'string' },
        },
      },
      BookingRequest: {
        type: 'object',
        required: ['fullName', 'phone', 'citySlug', 'relatedSlug', 'bookingType'],
        properties: {
          fullName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          citySlug: { type: 'string' },
          relatedSlug: { type: 'string' },
          bookingType: { type: 'string', enum: ['property', 'tour', 'offer'] },
          checkIn: { type: 'string', description: 'ISO date/datetime string' },
          checkOut: { type: 'string' },
          guests: { type: 'integer' },
          notes: { type: 'string' },
        },
      },
      BookingResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          confirmationId: { type: 'string' },
          payload: { $ref: '#/components/schemas/BookingRequest' },
        },
      },
      ContactRequest: {
        type: 'object',
        required: ['fullName', 'phone', 'subject', 'message'],
        properties: {
          fullName: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          subject: { type: 'string' },
          message: { type: 'string' },
        },
      },
      ContactResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          payload: { $ref: '#/components/schemas/ContactRequest' },
        },
      },
      ReviewRequest: {
        type: 'object',
        required: ['targetType', 'name', 'text', 'rating'],
        properties: {
          targetType: { type: 'string', enum: ['app', 'service', 'tour', 'project'] },
          targetSlug: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          text: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          role: { type: 'string' },
          citySlug: { type: 'string' },
        },
      },
      ReviewResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          id: { type: 'string' },
        },
      },
    },
  },
};
