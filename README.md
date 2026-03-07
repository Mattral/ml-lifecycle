# 🧠 ML Lifecycle Explorer

> **An interactive, end-to-end machine learning lifecycle simulation built with React + TypeScript.**

Learn and experience the complete ML pipeline — from data ingestion to production monitoring — through a guided, hands-on journey. No backend required.

![ML Lifecycle Explorer](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker) ![K8s](https://img.shields.io/badge/Kubernetes-Ready-blue?logo=kubernetes) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Kubernetes Deployment](#-kubernetes-deployment)
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

The app guides users through 12 pipeline stages with real-world context, production insights, and hands-on simulation.

---

## ✨ Features

### 🗺️ Guided Journey Experience
- **Visual storytelling** sidebar navigation with progress tracking
- **"Real World" insights** explaining production tools and practices at each step
- **Progressive disclosure** — complexity revealed as you advance
- **Contextual help** tooltips throughout the interface

### 📊 Complete ML Pipeline (12 Stages)

| Phase | Stages | Key Features |
|-------|--------|-------------|
| **Data** | Ingestion, Exploration, Cleaning | Sample datasets, EDA charts, quality reports, imputation |
| **Build** | Feature Engineering, Training, Evaluation | Feature transforms, live training simulation, comprehensive metrics & plots |
| **Ship** | Interpretability, Packaging, Deployment | SHAP explanations, What-If analysis, Docker packaging, REST API simulation |
| **Operate** | Monitoring, CI/CD, Dashboard | Live drift detection, automated pipeline with logs, export summaries |

### 🏗️ Production-Ready Infrastructure
- **Docker** multi-stage build with nginx for production
- **Kubernetes** manifests: Deployment, Service, Ingress, HPA
- **CI/CD** pipeline simulation with realistic stage logs
- **Monitoring** with drift detection and alerting

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   ML Lifecycle Explorer               │
│                                                       │
│  ┌──────────┐  ┌──────────────────────────────────┐  │
│  │ Sidebar   │  │         Main Content              │  │
│  │ Navigation│  │                                    │  │
│  │           │  │  ┌──────────────────────────────┐  │  │
│  │ • Data    │  │  │  Module Component             │  │  │
│  │ • Build   │  │  │  (1 of 12 pipeline stages)   │  │  │
│  │ • Ship    │  │  │                                │  │  │
│  │ • Operate │  │  │  Charts • Forms • Simulation  │  │  │
│  │           │  │  └──────────────────────────────┘  │  │
│  └──────────┘  └──────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  MLPipelineContext (React Context + State)       │  │
│  │  Dataset → Features → Model → Predictions       │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### State Management

The app uses React Context (`MLPipelineContext`) to share state across all 12 modules:

- **Dataset**: Raw and cleaned data
- **Features**: Selected features and transformations
- **Model**: Trained model metadata and metrics
- **Predictions**: Evaluation results and predictions
- **Logs**: Cleaning logs, transformation history

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (recommended: install with [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Development

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

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

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the production image
docker build -t ml-lifecycle-explorer .

# Run the container
docker run -d -p 3000:80 --name ml-explorer ml-lifecycle-explorer

# Open → http://localhost:3000
```

### Docker Compose

```bash
# Production mode
docker-compose up -d ml-explorer

# Development mode (with hot reload)
docker-compose --profile dev up ml-explorer-dev

# Stop services
docker-compose down
```

### Multi-Architecture Build

```bash
# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/your-org/ml-lifecycle-explorer:latest \
  --push .
```

---

## ☸️ Kubernetes Deployment

### Prerequisites

- A running K8s cluster (minikube, EKS, GKE, AKS, etc.)
- `kubectl` configured
- Container image pushed to a registry

### Deploy

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 3. (Optional) Configure ingress and autoscaling
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# 4. Verify deployment
kubectl get pods -n ml-explorer
kubectl get svc -n ml-explorer
```

### Access

```bash
# Port-forward for local access
kubectl port-forward svc/ml-explorer-service 3000:80 -n ml-explorer

# Open → http://localhost:3000
```

### K8s Manifests Included

| File | Purpose |
|------|---------|
| `k8s/namespace.yaml` | Isolated namespace for the app |
| `k8s/deployment.yaml` | 3-replica deployment with health checks, resource limits, security context |
| `k8s/service.yaml` | ClusterIP service for internal routing |
| `k8s/ingress.yaml` | NGINX Ingress with TLS termination |
| `k8s/hpa.yaml` | Horizontal Pod Autoscaler (2-10 replicas, CPU/memory based) |

---

## 📦 ML Pipeline Stages

### 1. 📥 Data Ingestion
Choose from sample datasets (Titanic, House Prices, Customer Churn) or simulate file upload. Includes schema validation, type detection, and missing value checks.

### 2. 🔍 Exploratory Data Analysis
Interactive visualizations: histograms, scatter plots, pie charts, correlation analysis. Statistical summaries including skewness, kurtosis, and box plot analysis.

### 3. 🧹 Data Cleaning
Automated quality reports with severity indicators. Options: drop missing rows, impute with mean/mode, remove IQR outliers. Before/after comparison with cleaning logs.

### 4. ⚙️ Feature Engineering
Target variable selection with task type detection. Feature transformations (log, min-max, z-score, binning). Categorical encoding with visual indicators. Histogram previews for transformation effects.

### 5. 🏋️ Model Training
Choose from classification (Logistic Regression, Decision Tree, Neural Network) or regression models. Real-time training simulation with live loss/accuracy metrics.

### 6. 📊 Model Evaluation
Comprehensive metrics (accuracy, precision, recall, F1, R², MAE, RMSE). Visualizations: prediction plots, ROC curves, confusion matrices, residual analysis, learning curves, feature importance.

### 7. 🔬 Model Interpretability
SHAP-like global feature importance. Individual prediction explanations. What-If counterfactual analysis ("What if Age = 60?").

### 8. 📦 Model Packaging
Model metadata with version, timestamp, SHA256 hash. Feature configuration export. JSON metadata download.

### 9. 🚀 Deployment Simulation
REST API simulation with real-time predictions. Latency simulation (50-250ms). Deployment environment status.

### 10. 📡 Monitoring & Drift Detection
Live data streaming simulation. Feature drift analysis (training vs live distributions). Drift alerts with configurable thresholds.

### 11. 🔄 CI/CD Pipeline
11-stage automated pipeline simulation with realistic logs. Stages: checkout, lint, test, validate, train, threshold check, Docker build, registry push, staging deploy, integration tests, production deploy. Retraining trigger support.

### 12. 📋 Pipeline Dashboard
Complete pipeline timeline view. Stats overview. Infrastructure summary. Export pipeline run as JSON.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Component library |
| [Recharts](https://recharts.org) | Data visualization |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Lucide Icons](https://lucide.dev) | Icon system |
| [Docker](https://docker.com) | Containerization |
| [Kubernetes](https://kubernetes.io) | Orchestration |
| [nginx](https://nginx.org) | Production web server |

---

## 📁 Project Structure

```
ml-lifecycle-explorer/
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   ├── ml-modules/          # Pipeline stage modules
│   │   │   ├── MLPipelineContext.tsx    # Shared state
│   │   │   ├── DataIngestionModule.tsx
│   │   │   ├── EDAModule.tsx
│   │   │   ├── DataCleaningModule.tsx
│   │   │   ├── FeatureEngineeringModule.tsx
│   │   │   ├── ModelTrainingModule.tsx
│   │   │   ├── EvaluationModule.tsx
│   │   │   ├── ModelInterpretabilityModule.tsx
│   │   │   ├── ModelPackagingModule.tsx
│   │   │   ├── DeploymentSimulationModule.tsx
│   │   │   ├── MonitoringModule.tsx
│   │   │   ├── CICDPipelineModule.tsx
│   │   │   └── PipelineDashboardModule.tsx
│   │   ├── ui/                  # shadcn/ui components
│   │   └── MLPipelineApp.tsx    # Main app shell
│   ├── pages/
│   │   └── Index.tsx
│   ├── hooks/
│   ├── lib/
│   ├── index.css                # Design tokens
│   ├── App.tsx
│   └── main.tsx
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # Local orchestration
├── nginx.conf                   # Production nginx config
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Use semantic design tokens from `index.css` — never hardcode colors
- Keep modules self-contained with clear `onComplete` props
- Add "Real World" insights for every new pipeline stage
- Ensure responsive design across all breakpoints
- Write TypeScript with proper interfaces

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ using <a href="https://lovable.dev">Lovable</a></strong>
</p>
