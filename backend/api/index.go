package handler

import (
	"net/http"

	"github.com/femisowemimo/booking-appointment/backend/pkg/bootstrap"
)

// Handler is the entrypoint for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			http.Error(w, "Internal Server Error: Panic detected", http.StatusInternalServerError)
			// Log the panic for Vercel logs
			// In a real app, you might want to print the stack trace
			println("PANIC RECOVERED:", err)
		}
	}()

	h := bootstrap.GetHandler()
	h.ServeHTTP(w, r)
}
