# 10XTODO - LLM-Powered AI Task Planner

## Project Description

A modern web application that leverages a large language model (LLM) to help you break down complex goals into actionable tasks and subtasks, manage them in a single list, and iterate on AI-generated proposals.

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started (Local)](#getting-started-local)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

- **Frontend**:  
  - [Nuxt 3 (Vue 3)](https://v3.nuxtjs.org/)
  - [Pinia](https://pinia.vuejs.org/) for state management
  - [TypeScript 5](https://www.typescriptlang.org/)
  - [Tailwind 4](https://tailwindcss.com/)
  - [Shadcn/vue](https://github.com/shadcn/ui) (Reka UI components)

- **Backend**:
  - [Supabase](https://supabase.com/) (PostgreSQL database, Auth)

- **AI Integration**:
  - [Openrouter.ai](https://openrouter.ai/) for LLM access

- **CI/CD & Hosting**:
  - [GitHub Actions](https://github.com/features/actions)
  - Docker
  - DigitalOcean

- **Testing**:
  - [Vitest](https://vitest.dev/) for unit and integration tests
  - [Vue Test Utils](https://test-utils.vuejs.org/) for Vue component testing
  - [Playwright](https://playwright.dev/) for end-to-end testing
  - [Supertest](https://github.com/ladjs/supertest) & [MSW](https://mswjs.io/) for API testing

## Getting Started (Local)

1. **Clone the repository**  
   ```bash
   git clone https://github.com/mandziukGIT/10xTODO.git
   cd 10xTODO
   ```

2. **Ensure you are using the correct Node version:**
   This project uses the Node version specified in the `.nvmrc` file. Currently it's **22.18.0**.
   ```bash
   nvm use
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Configure environment variables**
   Create a `.env` file in the project root and add:

   ```ini
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

5. **Run in development mode**

   ```bash
   npm run dev
   ```

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the project for production.
- **`npm run generate`**: Generate a static version of the site.
- **`npm run preview`**: Previews the production build locally.
- **`npm run postinstall`**: Prepare Nuxt after install.
- **`npm run lint`**: Runs ESLint to check for linting issues.
- **`npm run lint:fix`**: Automatically fixes linting issues.
- **`npm run format`**: Formats the code using Prettier.

## Testing

The project uses a comprehensive testing strategy:

- **Unit & Integration Tests**: Using Vitest and Vue Test Utils to test components, composables, Pinia stores, and API endpoints.
- **End-to-End Tests**: Using Playwright to simulate real user scenarios across the entire application.
- **API Tests**: Using Supertest and MSW (Mock Service Worker) to test and mock API endpoints.

Run tests with:
```bash
npm run test        # Run all tests
npm run test:unit   # Run unit tests only
npm run test:e2e    # Run end-to-end tests only
```

## Project Scope

This application supports:

* **AI-guided planning sessions**:

  * Input a goal/problem → validate → generate 4–8 task proposals via LLM
  * Iterate: edit proposals, split into subtasks, delete as needed
  * Session persistence until accept/reject

* **Task & subtask management**:

  * Single task list with up to two levels of subtasks
  * CRUD operations (limits: 10 top-level, 5 second-level)
  * Mark tasks/subtasks as complete

* **User accounts & authentication**:

  * Email/password registration and login via Supabase Auth
  * Secure access to your tasks
  * Account deletion

## Project Status

The project is currently in the MVP stage and under active development.

## License

This project is licensed under the [MIT License](LICENSE).

