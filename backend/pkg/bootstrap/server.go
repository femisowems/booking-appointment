package bootstrap

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/femisowemimo/booking-appointment/backend/pkg/adapters/handlers"
	"github.com/femisowemimo/booking-appointment/backend/pkg/adapters/messaging"
	"github.com/femisowemimo/booking-appointment/backend/pkg/adapters/repositories"
	"github.com/femisowemimo/booking-appointment/backend/pkg/core/services"
	_ "github.com/lib/pq"
	amqp "github.com/rabbitmq/amqp091-go"
)

var (
	Repo      *repositories.PostgresAppointmentRepository
	Publisher *messaging.RabbitMQPublisher
	server    http.Handler
	once      sync.Once
)

func GetHandler() http.Handler {
	once.Do(func() {
		log.Println("Initializing Appointment API Service...")

		// 1. Database Connection
		dbConnStr := os.Getenv("DATABASE_URL")
		if dbConnStr == "" {
			dbConnStr = "postgres://user:password@localhost:5432/appointments?sslmode=disable"
		}
		db, err := sql.Open("postgres", dbConnStr)
		if err != nil {
			log.Fatalf("Failed to connect to DB: %v", err)
		}
		// Note: We don't close DB here as the handler needs it. 
		// It will be closed when the process terminates.

		// 1.5 Run Migrations
		// Try multiple paths to handle both local and Vercel environments
		paths := []string{
			"backend/migrations/001_initial_schema.sql", // From repo root
			"migrations/001_initial_schema.sql",         // From backend root
			"../migrations/001_initial_schema.sql",      // From api/index.go relative path (maybe)
			"./migrations/001_initial_schema.sql",       // Local relative
		}

		var migrationBytes []byte
		var readErr error
		
		for _, path := range paths {
			migrationBytes, readErr = os.ReadFile(path)
			if readErr == nil {
				log.Printf("Found migration file at: %s", path)
				break
			}
		}

		if readErr != nil {
			log.Printf("Warning: Could not read migration file: %v", readErr)
		} else {
			if _, err := db.Exec(string(migrationBytes)); err != nil {
				// Don't fatal here, might be already applied or transient
				log.Printf("Warning: Failed to run migrations: %v", err)
			} else {
				log.Println("Database migrations applied successfully.")
			}
		}

		if err := db.Ping(); err != nil {
			log.Printf("Warning: DB ping failed: %v", err)
		}

		// 2. RabbitMQ Connection
		amqpConnStr := os.Getenv("RABBITMQ_URL")
		if amqpConnStr == "" {
			amqpConnStr = "amqp://user:password@localhost:5672/"
		}
		
		// RabbitMQ is optional for cold start if it fails (don't crash the lambda)
		var rabbitConn *amqp.Connection
		rabbitConn, err = amqp.Dial(amqpConnStr)
		if err != nil {
			log.Printf("Warning: Failed to connect to RabbitMQ: %v", err)
		}

		// 3. Initialize Adapters
		Repo = repositories.NewPostgresAppointmentRepository(db)
		
		// Handle optional publisher
		if rabbitConn != nil {
			Publisher, err = messaging.NewRabbitMQPublisher(rabbitConn)
			if err != nil {
				log.Printf("Warning: Failed to init publisher: %v", err)
			}
		} else {
			log.Println("Running without messaging publisher")
		}

		// 4. Initialize Core Service
		svc := services.NewAppointmentService(Repo, Publisher)

		// 5. Initialize Handlers
		h := handlers.NewAppointmentHandler(svc)

		// 6. Routes
		mux := http.NewServeMux()
		mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		})
		mux.HandleFunc("/appointments", func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodPost {
				h.Create(w, r)
			} else if r.Method == http.MethodGet {
				h.Get(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})

		server = enableCORS(mux)
	})
	return server
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Correlation-ID")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
