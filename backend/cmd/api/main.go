package main

import (
	"log"
	"net/http"

	"github.com/femisowemimo/booking-appointment/backend/pkg/bootstrap"
)

func main() {
	log.Println("Starting Appointment API Service...")

	h := bootstrap.GetHandler()

	// 7. Start Server
	port := ":8080"
	log.Printf("Server listening on %s", port)
	if err := http.ListenAndServe(port, h); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
