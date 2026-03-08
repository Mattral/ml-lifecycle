# 🧠 ML Lifecycle Explorer

> **An interactive, end-to-end machine learning lifecycle simulation built with React + TypeScript.**

Learn and experience the complete ML pipeline — from data ingestion to production monitoring — through a guided, hands-on journey. No backend required.

![ML Lifecycle Explorer](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tests](https://img.shields.io/badge/Tests-19%20passing-brightgreen?logo=vitest) ![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker) ![K8s](https://img.shields.io/badge/Kubernetes-Ready-blue?logo=kubernetes) ![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=githubactions) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Testing](#-testing)
- [Docker Deployment](#-docker-deployment)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Security](#-security)
- [ML Pipeline Stages](#-ml-pipeline-stages)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🎯 Overview

ML Lifecycle Explorer is an **educational interactive web application** that simulates the complete machine learning lifecycle. It's designed for:

- **Students** learning ML concepts for the first time
- **Data Scientists** who want to understand MLOps practices
- **Engineers** transitioning into ML engineering roles
- **Teams** looking for a reference implementation of ML best practices

The app guides users through **14 pipeline stages** with real-world context, production insights, and hands-on simulation — all wrapped in an Apple-inspired glassmorphism UI.

---

## ✨ Features

### 🗺️ Guided Journey Experience
- **Apple-style UI** with glassmorphism sidebar, frosted glass top bar, and spring-animated transitions
- **Visual storytelling** navigation with progress tracking across 4 phases
- **"Production Insight"** panels explaining real-world tools and practices at each step
- **Interactive onboarding** walkthrough for first-time users
- **Smooth page transitions** with framer-motion blur, scale, and spring physics

### 📊 Complete ML Pipeline (14 Stages)

| Phase | Stages | Key Features |
|-------|--------|-------------|
| **Data** | Ingestion, Exploration, Cleaning | Sample datasets, EDA charts, quality reports, imputation |
| **Build** | Feature Store, Feature Engineering, Training, Evaluation | Centralized feature registry, transforms, live training simulation, comprehensive metrics |
| **Ship** | Interpretability, Packaging, Deployment | SHAP explanations, What-If analysis, Docker packaging, REST API simulation |
| **Operate** | Monitoring, Experiments, CI/CD, Dashboard | Drift detection, experiment tracking, automated pipeline, export summaries |

### 🏗️ Production-Ready Infrastructure
- **Docker** multi-stage build with nginx (non-root, read-only filesystem)
- **Kubernetes** manifests: Deployment, Service, Ingress, HPA, PDB, NetworkPolicy
- **GitHub Actions** CI/CD with lint, type-check, test, build, and Docker publish
- **Security scanning** with Trivy, CodeQL, npm audit, and kubeconform

### 🎨 Design System
- Semantic design tokens (HSL-based) with light/dark mode support
- Apple-inspired glassmorphism with `backdrop-blur` and `saturate(180%)`
- All colors use CSS variables — zero hardcoded values in components
- Recharts themed with `hsl(var(--primary))` for automatic theme adaptation

---

## 🏛️ Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    ML Lifecycle Explorer                    │
│                                                            │
│  ┌──────────────┐  ┌───────────────────────────────────┐  │
│  │   Sidebar     │  │          Main Content              │  │
│  │   Navigation  │  │                                     │  │
│  │               │  │  ┌───────────────────────────────┐  │  │
│  │  DATA         │  │  │  Module Component              │  │  │
│  │  • Ingestion  │  │  │  (1 of 14 pipeline stages)    │  │  │
│  │  • EDA        │  │  │                                 │  │  │
│  │  • Cleaning   │  │  │  Charts • Forms • Simulation   │  │  │
│  │               │  │  └───────────────────────────────┘  │  │
│  │  BUILD        │  │                                     │  │
│  │  • Features   │  │  ┌───────────────────────────────┐  │  │
│  │  • Training   │  │  │  AnimatePresence (transitions) │  │  │
│  │  • Evaluation │  │  │  blur + scale + spring physics │  │  │
│  │               │  │  └───────────────────────────────┘  │  │
│  │  SHIP         │  │                                     │  │
│  │  OPERATE      │  │                                     │  │
│  └──────────────┘  └───────────────────────────────────┘  │
│                                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  MLPipelineContext (React Context + useReducer)        │ │
│  │  Dataset → Features → Model → Predictions → Logs      │ │
│  └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### State Management

The app uses React Context (`MLPipelineContext`) with `useReducer` to share state across all 14 modules:

- **Dataset**: Raw and cleaned data, schema, column types
- **Features**: Selected features, transformations, feature store registry
- **Model**: Trained model metadata, hyperparameters, training history
- **Predictions**: Evaluation results, metrics, confusion matrices
- **Experiments**: Tracked runs with parameters and metrics
- **Logs**: Cleaning logs, transformation history, pipeline timeline

All modules are **lazy-loaded** via `React.lazy()` with `Suspense` for optimal bundle splitting.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (recommended: v20 LTS)
- npm, yarn, or [bun](https://bun.sh)

### Development

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd ml-lifecycle-explorer

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# → http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

---

## 🧪 Testing

The project uses [Vitest](https://vitest.dev) with [Testing Library](https://testing-library.com/) for unit and integration tests.

### Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Suite (19 tests)

| Test File | Tests | What's Covered |
|-----------|-------|---------------|
| `App.test.tsx` | 4 | App rendering, title, sidebar, progress display |
| `MLPipelineContext.test.tsx` | 6 | Context provider, state management, actions, error handling |
| `ErrorBoundary.test.tsx` | 3 | Error catching, fallback UI, reset functionality |
| `storage.test.ts` | 6 | LocalStorage persistence, serialization, error handling |

### Writing Tests

Tests live in `src/test/` and use the following stack:

- **Vitest** — Test runner (Vite-native, fast HMR)
- **@testing-library/react** — Component rendering and queries
- **@testing-library/jest-dom** — Custom DOM matchers
- **jsdom** — Browser environment simulation

```tsx
// Example test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## 🐳 Docker Deployment

### Dockerfile Overview

The project uses a **multi-stage Docker build** for minimal production images:

```
Stage 1: node:20-alpine (builder)
  → npm ci + npm run build → produces /app/dist

Stage 2: nginx:1.27-alpine (production)
  → Copies dist, runs as non-root (UID 101)
  → ~25MB final image
```

### Security Features

- ✅ Non-root execution (nginx user, UID 101)
- ✅ Read-only root filesystem
- ✅ No privilege escalation (`no-new-privileges`)
- ✅ All capabilities dropped
- ✅ Health check built-in
- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)

### Build and Run

```bash
# Build the production image
docker build -t ml-lifecycle-explorer .

# Run the container
docker run -d -p 3000:80 --name ml-explorer ml-lifecycle-explorer

# Open → http://localhost:3000

# Check health
docker inspect --format='{{.State.Health.Status}}' ml-explorer
```

### Docker Compose

```bash
# Production mode
docker compose up -d ml-explorer

# Development mode (with hot reload via volume mount)
docker compose --profile dev up ml-explorer-dev

# Stop all services
docker compose down
```

### Multi-Architecture Build

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/your-org/ml-lifecycle-explorer:latest \
  --push .
```

### nginx Configuration

The production nginx config (`nginx.conf`) includes:

- SPA fallback (`try_files $uri /index.html`)
- Gzip compression for text, JS, CSS, SVG
- Aggressive caching for Vite-hashed assets (`expires 1y`, `immutable`)
- Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Dotfile blocking
- Non-root temp paths

---

## ☸️ Kubernetes Deployment

### Prerequisites

- A running K8s cluster (minikube, kind, EKS, GKE, AKS)
- `kubectl` configured and authenticated
- Container image pushed to a registry (e.g., GHCR)

### Quick Deploy

```bash
# Deploy everything at once
kubectl apply -f k8s/

# Or step-by-step:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/pdb.yaml
kubectl apply -f k8s/ingress.yaml    # Requires ingress controller
kubectl apply -f k8s/hpa.yaml        # Requires metrics-server

# Verify
kubectl get all -n ml-explorer
```

### Access Locally

```bash
kubectl port-forward svc/ml-explorer-service 3000:80 -n ml-explorer
# Open → http://localhost:3000
```

### K8s Manifests

| File | Purpose |
|------|---------|
| `k8s/namespace.yaml` | Isolated `ml-explorer` namespace |
| `k8s/deployment.yaml` | 3-replica deployment with liveness/readiness/startup probes, resource limits, security context (non-root, read-only FS, drop ALL caps) |
| `k8s/service.yaml` | ClusterIP service on port 80 |
| `k8s/ingress.yaml` | NGINX Ingress with TLS via cert-manager |
| `k8s/hpa.yaml` | Horizontal Pod Autoscaler: 2–10 replicas based on CPU (70%) and memory (80%) |
| `k8s/pdb.yaml` | PodDisruptionBudget: `minAvailable: 1` for zero-downtime upgrades |
| `k8s/network-policy.yaml` | Restricts ingress to port 80, egress to DNS only |

### Production Checklist

Before deploying to production, update these values:

```yaml
# k8s/deployment.yaml — Replace container image
image: ghcr.io/your-org/ml-lifecycle-explorer:latest

# k8s/ingress.yaml — Replace domain
host: ml-explorer.yourdomain.com
```

Ensure these cluster prerequisites are installed:
- **Ingress controller** (e.g., `ingress-nginx`)
- **cert-manager** (for automatic TLS)
- **metrics-server** (for HPA)

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflows

The project includes two GitHub Actions workflows:

#### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

Triggered on push/PR to `main`:

```
lint-and-test:
  ├── Checkout
  ├── Setup Node.js 20 (with npm cache)
  ├── Install dependencies (npm ci)
  ├── Lint (eslint)
  ├── Type check (tsc --noEmit)
  ├── Run tests (vitest)
  └── Build (vite build)

docker-build (main branch only):
  ├── Setup Docker Buildx
  ├── Login to GHCR
  └── Build & push image (with GHA cache)
      → ghcr.io/<repo>:latest
      → ghcr.io/<repo>:<sha>
```

#### 2. Security Scanning (`.github/workflows/security.yml`)

Triggered on push/PR to `main` + weekly schedule (Monday 6am UTC):

| Job | Trigger | Description |
|-----|---------|-------------|
| `dependency-review` | PR only | Blocks PRs with high-severity dependency vulnerabilities |
| `npm-audit` | Always | Runs `npm audit --audit-level=high` |
| `codeql` | Always | Static analysis for JavaScript/TypeScript |
| `trivy-scan` | Push + schedule | Container image vulnerability scanning, results uploaded to GitHub Security |
| `k8s-lint` | Always | Validates K8s manifests with kubeconform |

### Setting Up CI/CD

1. **Connect to GitHub** via Lovable's GitHub integration
2. Workflows run automatically on push/PR to `main`
3. Docker images are published to **GitHub Container Registry (GHCR)** using `GITHUB_TOKEN` (no additional secrets needed)
4. Security scan results appear in the **Security** tab of your GitHub repo

---

## 🔒 Security

See [SECURITY.md](SECURITY.md) for the full security policy.

### Summary

| Layer | Measures |
|-------|----------|
| **Application** | CSP, HSTS, X-Frame-Options, no sensitive data (simulation only) |
| **Container** | Non-root (UID 101), read-only FS, all caps dropped, no privilege escalation |
| **Kubernetes** | Security contexts, network policies, PDB, resource limits, no service account token |
| **CI/CD** | npm audit, Trivy, CodeQL, dependency review, kubeconform, weekly scheduled scans |

---

## 📦 ML Pipeline Stages

### Phase 1: Data

#### 1. 📥 Data Ingestion
Choose from sample datasets (Titanic, House Prices, Customer Churn) or simulate file upload. Includes schema validation, type detection, and missing value checks.

#### 2. 🔍 Exploratory Data Analysis
Interactive visualizations: histograms, scatter plots, pie charts, correlation analysis. Statistical summaries including skewness, kurtosis, and box plot analysis.

#### 3. 🧹 Data Cleaning
Automated quality reports with severity indicators. Options: drop missing rows, impute with mean/mode, remove IQR outliers. Before/after comparison with cleaning logs.

### Phase 2: Build

#### 4. 🏪 Feature Store
Centralized feature registry for managing reusable feature definitions across projects. Track feature metadata, versioning, and lineage.

#### 5. ⚙️ Feature Engineering
Target variable selection with task type detection. Feature transformations (log, min-max, z-score, binning). Categorical encoding with visual indicators.

#### 6. 🏋️ Model Training
Choose from classification (Logistic Regression, Decision Tree, Neural Network) or regression models. Real-time training simulation with live loss/accuracy curves.

#### 7. 📊 Model Evaluation
Comprehensive metrics (accuracy, precision, recall, F1, R², MAE, RMSE). Visualizations: prediction plots, ROC curves, confusion matrices, residual analysis, learning curves.

### Phase 3: Ship

#### 8. 🔬 Model Interpretability
SHAP-like global feature importance. Individual prediction explanations. What-If counterfactual analysis.

#### 9. 📦 Model Packaging
Model metadata with version, timestamp, SHA256 hash. Feature configuration export. JSON metadata download.

#### 10. 🚀 Deployment Simulation
REST API simulation with real-time predictions. Latency simulation (50–250ms). Deployment environment status.

### Phase 4: Operate

#### 11. 📡 Monitoring & Drift Detection
Live data streaming simulation. Feature drift analysis (training vs live distributions). Drift alerts with configurable thresholds.

#### 12. 🧪 Experiment Tracking
Track multiple training runs with hyperparameters and metrics. Compare experiments side-by-side. Log artifacts and notes.

#### 13. 🔄 CI/CD Pipeline
11-stage automated pipeline simulation with realistic logs. Stages: checkout, lint, test, validate, train, threshold check, Docker build, registry push, staging deploy, integration tests, production deploy.

#### 14. 📋 Pipeline Dashboard
Complete pipeline timeline view. Stats overview. Infrastructure summary. Export full pipeline run as JSON.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 18](https://react.dev) | UI framework with lazy loading |
| [TypeScript 5](https://typescriptlang.org) | Type safety |
| [Vite 5](https://vitejs.dev) | Build tool with HMR |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling with semantic tokens |
| [shadcn/ui](https://ui.shadcn.com) | Radix-based component library |
| [Recharts](https://recharts.org) | Data visualization (themed via CSS vars) |
| [Framer Motion](https://www.framer.com/motion/) | Page transitions and animations |
| [Vitest](https://vitest.dev) | Unit and integration testing |
| [Testing Library](https://testing-library.com/) | Component test utilities |
| [Lucide Icons](https://lucide.dev) | Icon system |
| [Docker](https://docker.com) | Multi-stage containerization |
| [nginx](https://nginx.org) | Production web server |
| [Kubernetes](https://kubernetes.io) | Container orchestration |
| [GitHub Actions](https://github.com/features/actions) | CI/CD and security scanning |

---

## 📁 Project Structure

```
ml-lifecycle-explorer/
├── .github/
│   └── workflows/
│       ├── ci.yml                   # CI/CD: lint, test, build, Docker push
│       └── security.yml             # Security: npm audit, Trivy, CodeQL, kubeconform
├── k8s/
│   ├── namespace.yaml               # ml-explorer namespace
│   ├── deployment.yaml              # 3 replicas, probes, security context
│   ├── service.yaml                 # ClusterIP on port 80
│   ├── ingress.yaml                 # TLS ingress with cert-manager
│   ├── hpa.yaml                     # Autoscaler (2–10 pods)
│   ├── pdb.yaml                     # Pod disruption budget
│   └── network-policy.yaml          # Ingress/egress restrictions
├── src/
│   ├── components/
│   │   ├── ml-modules/              # 14 pipeline stage modules
│   │   │   ├── MLPipelineContext.tsx       # Shared state (Context + Reducer)
│   │   │   ├── OnboardingWalkthrough.tsx   # First-time user experience
│   │   │   ├── DataIngestionModule.tsx
│   │   │   ├── EDAModule.tsx
│   │   │   ├── DataCleaningModule.tsx
│   │   │   ├── FeatureStoreModule.tsx
│   │   │   ├── FeatureEngineeringModule.tsx
│   │   │   ├── ModelTrainingModule.tsx
│   │   │   ├── EvaluationModule.tsx
│   │   │   ├── ModelInterpretabilityModule.tsx
│   │   │   ├── ModelPackagingModule.tsx
│   │   │   ├── DeploymentSimulationModule.tsx
│   │   │   ├── MonitoringModule.tsx
│   │   │   ├── ExperimentTrackingModule.tsx
│   │   │   ├── CICDPipelineModule.tsx
│   │   │   └── PipelineDashboardModule.tsx
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── ErrorBoundary.tsx         # Global error boundary
│   │   └── MLPipelineApp.tsx         # Main app shell
│   ├── test/
│   │   ├── setup.ts                 # Test environment setup
│   │   ├── App.test.tsx             # App integration tests
│   │   ├── MLPipelineContext.test.tsx # State management tests
│   │   ├── ErrorBoundary.test.tsx   # Error handling tests
│   │   └── storage.test.ts         # Persistence tests
│   ├── hooks/                       # Custom React hooks
│   ├── lib/
│   │   ├── utils.ts                 # Utility functions (cn, etc.)
│   │   └── storage.ts              # LocalStorage abstraction
│   ├── pages/
│   │   ├── Index.tsx                # Home page
│   │   └── NotFound.tsx             # 404 page
│   ├── index.css                    # Design system tokens (HSL)
│   ├── App.tsx                      # Router setup
│   └── main.tsx                     # Entry point
├── Dockerfile                       # Multi-stage build
├── docker-compose.yml               # Local dev + production
├── nginx.conf                       # Production server config
├── SECURITY.md                      # Security policy
├── tailwind.config.ts               # Extended Tailwind config
├── vitest.config.ts                 # Test configuration
├── tsconfig.json                    # TypeScript config
└── vite.config.ts                   # Vite build config
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Use semantic design tokens from `index.css` — **never hardcode colors** in components
- All Recharts colors must use `hsl(var(--token))` format
- Keep modules self-contained with clear `onComplete` props
- Add "Production Insight" context for every new pipeline stage
- Write TypeScript with proper interfaces (no `any`)
- Add tests for new modules in `src/test/`
- Ensure all 19 existing tests pass before submitting: `npm test`

### Code Quality

```bash
npm run lint          # ESLint
npx tsc --noEmit      # Type checking
npm test              # Run test suite
npm run build         # Production build
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ using <a href="https://lovable.dev">Lovable</a></strong>
</p>
