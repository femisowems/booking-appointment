package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/femisowemimo/booking-appointment/backend/pkg/adapters/messaging"
	"github.com/femisowemimo/booking-appointment/backend/pkg/adapters/repositories"
	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	log.Println("Starting Appointment Worker Service...")

	// 1. Initialize RabbitMQ
	amqpConnStr := os.Getenv("RABBITMQ_URL")
	if amqpConnStr == "" {
		amqpConnStr = "amqp://user:password@localhost:5672/"
	}
	rabbitConn, err := amqp.Dial(amqpConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer rabbitConn.Close()

	// 2. Initialize DynamoDB Client (LocalStack compatible)
	// Force custom resolver for LocalStack if env var present
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
		config.WithEndpointResolverWithOptions(aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				localstackURL := os.Getenv("AWS_ENDPOINT_URL")
				if localstackURL == "" {
					localstackURL = "http://localhost:4566"
				}
				return aws.Endpoint{
					URL:           localstackURL,
					SigningRegion: "us-east-1",
				}, nil
			}),
		),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	dynamoClient := dynamodb.NewFromConfig(cfg)
	
	// Create table if not exists (for demo simplicity)
	// In prod, use Terraform
	// ... (Skipping creation logic for brevity, assume script or manual run)

	repo := repositories.NewDynamoDBAppointmentRepository(dynamoClient, "AppointmentsReadModel")

	// 3. Start Worker
	worker := messaging.NewWorker(rabbitConn, repo)
	log.Fatalf("Worker exited: %v", worker.Start())
}
