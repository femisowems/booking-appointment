package handler

import (
	"net/http"

	"github.com/femisowemimo/booking-appointment/backend/pkg/bootstrap"
)

// Handler is the entrypoint for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	h := bootstrap.GetHandler()
	h.ServeHTTP(w, r)
}
