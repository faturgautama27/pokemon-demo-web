# Pokemon Demo Web Application

A modern, minimalist web application built with Angular 20 that showcases Pokemon from Region 1 (#001-#151) using the PokeAPI V2. This application serves as an innovative demo for the Sales Team to present to potential clients before the launch of a new Pokemon game.

## Features

- **Grid-based Pokemon List**: Display Pokemon in a 5×2 grid layout (10 cards per page)
- **Interactive Pokemon Cards**: Hover effects and click interactions
- **Detailed Pokemon Information**: Modal popup with comprehensive Pokemon data
- **Smart Pagination**: Centered current page with max 7 buttons
- **Responsive Design**: Adapts to all screen sizes (mobile, tablet, desktop)
- **Graceful Error Handling**: User-friendly error messages with retry options
- **Modern UI**: Clean design with TailwindCSS and PrimeNG components

## Technology Stack

- **Framework**: Angular 20 (standalone components)
- **State Management**: NGXS 20
- **UI Components**: PrimeNG 20
- **Styling**: TailwindCSS v4 (via @tailwindcss/postcss)
- **Icons**: Lucide Angular Icons
- **Testing**: Jasmine/Karma + fast-check (property-based testing)
- **Language**: TypeScript 5.9 (strict mode)

## Dependencies

### Production Dependencies
- `@angular/common`: ^20.3.0
- `@angular/compiler`: ^20.3.0
- `@angular/core`: ^20.3.0
- `@angular/forms`: ^20.3.0
- `@angular/platform-browser`: ^20.3.0
- `@angular/router`: ^20.3.0
- `@ngxs/store`: ^20.1.0
- `@ngxs/devtools-plugin`: ^20.0.0
- `@primeuix/themes`: ^2.0.3
- `primeng`: ^20.4.0
- `primeicons`: ^7.0.0
- `@tailwindcss/postcss`: ^4.1.18
- `postcss`: ^8.5.6
- `lucide-angular`: ^0.575.0
- `rxjs`: ~7.8.0
- `tslib`: ^2.3.0

### Development Dependencies
- `@angular/build`: ^20.3.16
- `@angular/cli`: ^20.3.16
- `@angular/compiler-cli`: ^20.3.0
- `@types/jasmine`: ~5.1.0
- `angular-eslint`: 21.0.1
- `eslint`: ^9.39.1
- `fast-check`: ^4.5.3
- `jasmine-core`: ~5.9.0
- `karma`: ~6.4.0
- `karma-chrome-launcher`: ~3.2.0
- `karma-coverage`: ~2.2.0
- `karma-jasmine`: ~5.1.0
- `karma-jasmine-html-reporter`: ~2.1.0
- `typescript`: ~5.9.2
- `typescript-eslint`: 8.46.4

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pokemon-demo-web
```

2. Install dependencies:
```bash
npm install
```

## Local Development

Start the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Build the project for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

Build for development:
```bash
npm run build -- --configuration development
```

## Testing

Run unit tests:
```bash
npm test
```

Run tests with code coverage:
```bash
npm test -- --code-coverage
```

Run tests in headless mode (CI):
```bash
npm test -- --no-watch --browsers=ChromeHeadless
```

## Linting

Run ESLint:
```bash
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Data models and interfaces
│   │   └── services/        # API services and utilities
│   ├── features/
│   │   └── pokemon/
│   │       ├── components/  # Pokemon-related components
│   │       └── store/       # NGXS state management
│   └── shared/              # Shared components and utilities
├── styles.scss              # Global styles
└── main.ts                  # Application entry point
```

## Configuration

### TailwindCSS

TailwindCSS v4 is configured via `.postcssrc.json` and `tailwind.config.js`. Custom theme colors and breakpoints are defined in `tailwind.config.js`.

### TypeScript

TypeScript is configured with strict mode enabled. See `tsconfig.json` for compiler options.

### ESLint

ESLint is configured with Angular-specific rules. See `eslint.config.js` for linting rules.

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## License

This project is private and proprietary.

## Contributing

This is a demo project for internal use. Please contact the development team for contribution guidelines.
