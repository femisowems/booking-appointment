# Appointment Booking Frontend

This is the React frontend for the Appointment Booking System. It provides a user-friendly interface for customers to book appointments with providers.

## ✨ Features

- **Provider Selection:** Choose from available doctors (Dr. Smith, Dr. Jones).
- **Smart Date & Time Picking:** 
  - Prevents booking in the past.
  - Automatically handles timezone conversions (validates locally, sends UTC).
  - Visual layout optimized for clarity.
- **State-Driven Booking Flow:**
  - **Idle:** Clean form for input.
  - **Loading:** Spinner and disabled inputs during network requests.
  - **Success:** Confirmation card with a reference ID.
  - **Error:** Dismissible alerts for validation or API errors.
- **Accessibility (A11y):** ARIA live regions for status updates, keyboard-navigable inputs, and high-contrast styling.
- **Responsive Design:** Mobile-friendly card layout.

## 🛠 Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **CSS Variables** (Theming)
- **Custom Components** (No heavy UI libraries)

## 📂 Project Structure

```
web/src/
├── api/             # API client for backend communication
├── components/
│   ├── BookingCard.tsx      # Main layout container
│   ├── BookingForm.tsx      # Core logic and state management
│   ├── BookingStatus.tsx    # Feedback (Success/Error/Loading)
│   ├── BookingSummary.tsx   # Request summary view
│   ├── DatePicker.tsx       # Custom date input wrapper
│   ├── TimePicker.tsx       # Custom time input wrapper
│   └── ProviderSelect.tsx   # Dropdown component
├── hooks/           # Custom React hooks (e.g., useClock)
└── App.tsx          # Root component
```

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## 🎨 Styling

Global styles are defined in `src/index.css` using CSS variables for widely used tokens:
- Colors (`--primary-color`, `--success-color`, etc.)
- Spacing (`--spacing-md`, etc.)
- Typography

Component-specific styles are co-located in `.css` files (e.g., `BookingForm.css`).
